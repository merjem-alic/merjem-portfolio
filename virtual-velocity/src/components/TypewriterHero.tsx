import { useState, useEffect } from 'react';

const FULL_TEXT = 'Hi! my name is Merjem.';
const INTERVAL_MS = 65;

export default function TypewriterHero() {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (displayText.length >= FULL_TEXT.length) {
      setIsComplete(true);
      return;
    }

    const timer = setInterval(() => {
      setDisplayText((prev) => {
        const next = FULL_TEXT.slice(0, prev.length + 1);
        if (next.length >= FULL_TEXT.length) {
          clearInterval(timer);
          setIsComplete(true);
        }
        return next;
      });
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-3xl md:text-4xl font-bold text-text leading-relaxed">
        {displayText}
        <span
          className={`text-blue ml-0.5 ${isComplete ? 'animate-blink' : 'opacity-100'}`}
        >
          █
        </span>
      </p>
      <p
        className="text-subtext text-base md:text-lg animate-fade-in-up"
        style={{ opacity: 0, animationDelay: '2.2s', animationFillMode: 'forwards' }}
      >
        Software engineering student @ IBU
      </p>
    </div>
  );
}
