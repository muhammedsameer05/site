function parseTargetDate(dateStr) {
  if (!dateStr) return new Date('2026-08-24T09:00:00').getTime();
  
  let cleanStr = String(dateStr).trim();
  
  // Standard ISO parser
  let timestamp = Date.parse(cleanStr);
  if (!isNaN(timestamp)) return timestamp;

  // Replace space with T if formatted like '2026-08-24 09:00'
  if (cleanStr.includes(' ')) {
    let isoFormatted = cleanStr.replace(' ', 'T');
    timestamp = Date.parse(isoFormatted);
    if (!isNaN(timestamp)) return timestamp;
  }

  // Regex parse for DD-MM-YYYY or YYYY-MM-DD
  const parts = cleanStr.match(/^(\d{1,4})[-/](\d{1,2})[-/](\d{1,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
  if (parts) {
    let num1 = parseInt(parts[1], 10);
    let num2 = parseInt(parts[2], 10);
    let num3 = parseInt(parts[3], 10);
    
    let year, month, day;
    if (num1 > 1000) { // YYYY-MM-DD
      year = num1;
      month = num2 - 1;
      day = num3;
    } else { // DD-MM-YYYY
      day = num1;
      month = num2 - 1;
      year = num3;
    }

    let hours = parts[4] ? parseInt(parts[4], 10) : 9;
    let minutes = parts[5] ? parseInt(parts[5], 10) : 0;
    let seconds = parts[6] ? parseInt(parts[6], 10) : 0;
    let ampm = parts[7] ? parts[7].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes, seconds).getTime();
  }

  return new Date('2026-08-24T09:00:00').getTime();
}

export default function CountdownTimer({ targetDate, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const target = parseTargetDate(targetDate);

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
