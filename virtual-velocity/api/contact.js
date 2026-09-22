const ERROR_MESSAGES = [
  "not today, weather boy",
  "nice try. try again in a few minutes.",
  "formspree quota says no. so do i.",
  "calm down, satan.",
];

const BLOCKED_MESSAGES = [
  "not today, satan.",
  "i know who you are.",
  "go outside.",
  "this is between you and formspree now.",
];

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const GLOBAL_DAILY_LIMIT = 5;
const GLOBAL_DAILY_WINDOW_SECONDS = 24 * 60 * 60;
const GLOBAL_DAILY_KEY = "contact-global-daily";
const AT_CAPACITY_MESSAGE = "This form has reached today's message limit — please email me directly instead.";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjybnwng";
const TURNSTILE_VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function randomFunnyMessage() {
  return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
}

function randomBlockedMessage() {
  return BLOCKED_MESSAGES[Math.floor(Math.random() * BLOCKED_MESSAGES.length)];
}

async function notifyDiscord(reason, ip) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `**Contact form alert:** ${reason} — IP: \`${ip ?? "unknown"}\``,
      }),
    });
  } catch (error) {
    console.error("discord webhook error:", error);
  }
}

function isBlockedIp(ip) {
  const raw = process.env.BLOCKED_IPS;
  if (!raw || !ip) {
    return false;
  }

  const blockedIps = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return blockedIps.includes(ip);
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp;
  }
  return null;
}

async function incrementCounter(key, windowSeconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis is not configured");
  }

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSeconds), "NX"],
    ]),
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed with status ${response.status}`);
  }

  const results = await response.json();
  return results?.[0]?.result;
}

async function isRateLimited(ip) {
  const count = await incrementCounter(`contact-rl:${ip}`, RATE_LIMIT_WINDOW_SECONDS);
  return typeof count === "number" && count > RATE_LIMIT_MAX;
}

async function isGlobalCapReached() {
  const count = await incrementCounter(GLOBAL_DAILY_KEY, GLOBAL_DAILY_WINDOW_SECONDS);
  return typeof count === "number" && count > GLOBAL_DAILY_LIMIT;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("Turnstile secret key is not configured");
  }
  if (!token) {
    return false;
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) {
    body.set("remoteip", ip);
  }

  const response = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data?.success === true;
}

async function forwardToFormspree({ name, email, message }) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, email, message }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const errorMessage =
      data?.errors?.map((e) => e.message).join(", ") || "Something went wrong. Please try again.";
    return { ok: false, message: errorMessage };
  }

  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const ip = getClientIp(req);
  console.log("Contact form IP:", ip);

  if (isBlockedIp(ip)) {
    await notifyDiscord("blocked IP tried to submit", ip);
    return res.status(403).json({ error: randomBlockedMessage() });
  }

  const body = req.body ?? {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const honeypot = typeof body._gotcha === "string" ? body._gotcha.trim() : "";
  const turnstileToken = typeof body["cf-turnstile-response"] === "string" ? body["cf-turnstile-response"] : "";

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill in all fields before sending." });
  }

  // Honeypot field: real visitors never fill this in. Bots that do get a
  // fake success response so they don't learn to avoid the trap.
  if (honeypot) {
    await notifyDiscord("honeypot triggered", ip);
    return res.status(200).json({ ok: true });
  }

  try {
    if (await isRateLimited(ip)) {
      await notifyDiscord("rate limit hit (3/hour)", ip);
      return res.status(429).json({ error: randomFunnyMessage() });
    }

    const isHuman = await verifyTurnstile(turnstileToken, ip);
    if (!isHuman) {
      await notifyDiscord("Turnstile verification failed", ip);
      return res.status(403).json({ error: randomFunnyMessage() });
    }

    if (await isGlobalCapReached()) {
      await notifyDiscord("global daily cap reached (5/day)", ip);
      return res.status(503).json({ error: AT_CAPACITY_MESSAGE });
    }

    const result = await forwardToFormspree({ name, email, message });
    if (!result.ok) {
      return res.status(502).json({ error: result.message });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("contact form error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
