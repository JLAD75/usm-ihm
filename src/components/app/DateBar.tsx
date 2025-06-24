import { useEffect, useState } from 'react';

function DateBar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="flex-1 text-base font-light text-gray-400 tracking-wide select-none text-center transition-colors"
      style={{ fontFamily: 'Manrope, sans-serif', background: 'none', border: 'none', outline: 'none', cursor: 'default', userSelect: 'none' }}
      title="Date et heure - dev"
    >
      <span style={{ userSelect: 'none' }}>{`${dateStr} — ${timeStr}`}</span>
    </div>
  );
}

export default DateBar;
