import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate || '2026-08-15T09:00:00').getTime();

    const calculate = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsFinished(false);
      } else {
        setIsFinished(true);
        if (typeof onFinish === 'function') {
          onFinish();
        }
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onFinish]);

  if (isFinished || !timeLeft) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-4 max-w-lg mx-auto px-1">
      {[
        { label: 'Days', val: timeLeft.days },
        { label: 'Hours', val: timeLeft.hours },
        { label: 'Minutes', val: timeLeft.minutes },
        { label: 'Seconds', val: timeLeft.seconds }
      ].map((item, idx) => (
        <div key={idx} className="glass-panel p-2 sm:p-4 rounded-xl text-center border border-amber-400/30 bg-[#04261E] shadow-lg">
          <span className="block text-xl sm:text-4xl font-extrabold gold-gradient-text font-mono leading-tight">
            {String(item.val).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-300/80 block mt-0.5">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
