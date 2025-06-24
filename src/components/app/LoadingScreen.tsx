import { useEffect, useRef, useState } from 'react';

const segments: Record<'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'.', number[]> = {
  '0': [1,1,1,1,1,1,0],
  '1': [0,1,1,0,0,0,0],
  '2': [1,1,0,1,1,0,1],
  '3': [1,1,1,1,0,0,1],
  '4': [0,1,1,0,0,1,1],
  '5': [1,0,1,1,0,1,1],
  '6': [1,0,1,1,1,1,1],
  '7': [1,1,1,0,0,0,0],
  '8': [1,1,1,1,1,1,1],
  '9': [1,1,1,1,0,1,1],
  '.': [0,0,0,0,0,0,0],
};

function LedDigit({ value }: { value: keyof typeof segments }) {
  const segs = segments[value] || [0,0,0,0,0,0,0];
  return (
    <span className="relative inline-block w-8 h-14 mx-0.5">
      <span className={`absolute left-1 top-0 w-6 h-2 rounded bg-[#39ff14] transition-all duration-75 ${segs[0] ? 'opacity-90 shadow-[0_0_8px_#39ff14,0_0_2px_#fff]' : 'opacity-10'}`} />
      <span className={`absolute right-0 top-1 w-2 h-6 rounded bg-[#39ff14] ${segs[1] ? 'opacity-90 shadow-[0_0_8px_#39ff14]' : 'opacity-10'}`} />
      <span className={`absolute right-0 bottom-1 w-2 h-6 rounded bg-[#39ff14] ${segs[2] ? 'opacity-90 shadow-[0_0_8px_#39ff14]' : 'opacity-10'}`} />
      <span className={`absolute left-1 bottom-0 w-6 h-2 rounded bg-[#39ff14] ${segs[3] ? 'opacity-90 shadow-[0_0_8px_#39ff14,0_0_2px_#fff]' : 'opacity-10'}`} />
      <span className={`absolute left-0 bottom-1 w-2 h-6 rounded bg-[#39ff14] ${segs[4] ? 'opacity-90 shadow-[0_0_8px_#39ff14]' : 'opacity-10'}`} />
      <span className={`absolute left-0 top-1 w-2 h-6 rounded bg-[#39ff14] ${segs[5] ? 'opacity-90 shadow-[0_0_8px_#39ff14]' : 'opacity-10'}`} />
      <span className={`absolute left-1 top-1/2 w-6 h-2 rounded bg-[#39ff14] -translate-y-1/2 ${segs[6] ? 'opacity-90 shadow-[0_0_8px_#39ff14,0_0_2px_#fff]' : 'opacity-10'}`} />
      <span className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(120deg,rgba(255,255,255,0.18) 30%,rgba(0,0,0,0.08) 80%)', borderRadius: 8}} />
      <span className="absolute left-0 top-0 w-full h-full pointer-events-none animate-led-sweep" style={{background: 'linear-gradient(120deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 60%)', borderRadius: 8}} />
    </span>
  );
}

function LedChrono({ seconds, ms }: { seconds: string; ms: string }) {
  return (
    <div className="flex items-center justify-center gap-1" style={{ filter: 'drop-shadow(0 0 8px #39ff14)' }}>
      <LedDigit value={seconds[0] as keyof typeof segments} />
      <LedDigit value={seconds[1] as keyof typeof segments} />
      <span className="relative w-4 h-14 flex items-center justify-center mx-0.5">
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#0ff] shadow-[0_0_8px_#0ff]" style={{ opacity: 0.85 }} />
      </span>
      <LedDigit value={ms[0] as keyof typeof segments} />
      <LedDigit value={ms[1] as keyof typeof segments} />
      <LedDigit value={ms[2] as keyof typeof segments} />
    </div>
  );
}

function SpeedLinesBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full z-0" style={{ filter: 'blur(1.5px)' }}>
      {[...Array(32)].map((_, i) => {
        const y = 6 + i * 22;
        const dur = 0.45 + (i % 4) * 0.13;
        const delay = (i * 0.07) % 0.7;
        const color = i % 5 === 0 ? '#0ff' : i % 3 === 0 ? '#fff' : '#39ff14';
        return (
          <rect key={i} x={-200} y={y} width={700} height={2 + (i % 2)} fill={color} opacity={0.1 + 0.08 * (i % 3)}>
            <animate attributeName="x" from="-200" to="700" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
          </rect>
        );
      })}
    </svg>
  );
}

function LoadingScreen() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    let running = true;
    function tick() {
      if (!running) return;
      setElapsed(Date.now() - startRef.current);
      requestAnimationFrame(tick);
    }
    tick();
    return () => {
      running = false;
    };
  }, []);

  const seconds = Math.floor(elapsed / 1000).toString().padStart(2, '0');
  const ms = (elapsed % 1000).toString().padStart(3, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" style={{ overflow: 'hidden' }}>
      <SpeedLinesBackground />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          background: 'rgba(0,0,0,0.92)',
          borderRadius: 16,
          padding: '18px 32px',
          boxShadow: '0 0 32px #39ff14cc, 0 0 2px #000',
          border: '2.5px solid #39ff14',
          userSelect: 'none',
          minWidth: 220,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LedChrono seconds={seconds} ms={ms} />
      </div>
      <span className="absolute bottom-24 left-1/2 -translate-x-1/2 text-xl font-bold text-indigo-700 dark:text-indigo-200 drop-shadow-lg animate-pulse select-none z-10">
        Chargement…
      </span>
      <style>{`
        @keyframes led-sweep {
          0% { opacity: 0.18; transform: translateY(-60%) scaleY(0.7); }
          40% { opacity: 0.32; transform: translateY(0%) scaleY(1.1); }
          100% { opacity: 0.18; transform: translateY(60%) scaleY(0.7); }
        }
        .animate-led-sweep {
          animation: led-sweep 2.2s cubic-bezier(.4,0,.2,1) infinite;
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
