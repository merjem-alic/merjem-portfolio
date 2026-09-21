const ERROR_MESSAGES = [
  "not today, weather boy",
  "nice try. try again in a few minutes.",
  "formspree quota says no. so do i.",
  "calm down, satan.",
];

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjybnwng";
const TURNSTILE_VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function randomFunnyMessage() {
  return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
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

async function isRateLimited(ip) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis is not configured");
  }

  const key = `contact-rl:${ip}`;
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(RATE_LIMIT_WINDOW_SECONDS), "NX"],
    ]),
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed with status ${response.status}`);
  }

  const results = await response.json();
  const count = results?.[0]?.result;
  return typeof count === "number" && count > RATE_LIMIT_MAX;
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
    return res.status(200).json({ ok: true });
  }

  const ip = getClientIp(req);

  try {
    if (await isRateLimited(ip)) {
      return res.status(429).json({ error: randomFunnyMessage() });
    }

    const isHuman = await verifyTurnstile(turnstileToken, ip);
    if (!isHuman) {
      return res.status(403).json({ error: randomFunnyMessage() });
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
