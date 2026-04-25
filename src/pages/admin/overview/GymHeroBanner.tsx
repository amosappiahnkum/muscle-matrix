import React, { useState, useEffect } from 'react';

const DumbbellIllustration = () => (
  <svg viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <ellipse cx="210" cy="180" rx="160" ry="40" fill="rgba(251,146,60,0.15)" />
    <rect x="110" y="112" width="200" height="16" rx="8" fill="rgba(255,255,255,0.25)" />
    <rect x="72" y="88" width="28" height="64" rx="6" fill="rgba(255,255,255,0.35)" />
    <rect x="88" y="80" width="28" height="80" rx="6" fill="rgba(255,255,255,0.5)" />
    <rect x="320" y="88" width="28" height="64" rx="6" fill="rgba(255,255,255,0.35)" />
    <rect x="304" y="80" width="28" height="80" rx="6" fill="rgba(255,255,255,0.5)" />
    <rect x="114" y="115" width="192" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
    <text x="210" y="210" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="13" fontFamily="Georgia, serif" letterSpacing="3">STRENGTH</text>
  </svg>
);

const BarbelPressIllustration = () => (
  <svg viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="100" y="170" width="220" height="20" rx="10" fill="rgba(255,255,255,0.2)" />
    <rect x="130" y="188" width="20" height="30" rx="4" fill="rgba(255,255,255,0.15)" />
    <rect x="270" y="188" width="20" height="30" rx="4" fill="rgba(255,255,255,0.15)" />
    <ellipse cx="210" cy="160" rx="60" ry="10" fill="rgba(255,255,255,0.18)" />
    <line x1="165" y1="160" x2="155" y2="105" stroke="rgba(255,255,255,0.5)" strokeWidth="8" strokeLinecap="round"/>
    <line x1="255" y1="160" x2="265" y2="105" stroke="rgba(255,255,255,0.5)" strokeWidth="8" strokeLinecap="round"/>
    <rect x="80" y="96" width="260" height="14" rx="7" fill="rgba(255,255,255,0.35)" />
    <rect x="56" y="76" width="26" height="52" rx="5" fill="rgba(255,255,255,0.45)" />
    <rect x="338" y="76" width="26" height="52" rx="5" fill="rgba(255,255,255,0.45)" />
    <ellipse cx="210" cy="220" rx="130" ry="18" fill="rgba(251,146,60,0.12)" />
    <text x="210" y="235" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="Georgia, serif" letterSpacing="3">POWER</text>
  </svg>
);

const KettlebellIllustration = () => (
  <svg viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <ellipse cx="210" cy="215" rx="70" ry="14" fill="rgba(0,0,0,0.15)" />
    <circle cx="210" cy="148" r="64" fill="rgba(255,255,255,0.2)" />
    <circle cx="210" cy="148" r="56" fill="rgba(255,255,255,0.28)" />
    <path d="M178 110 Q178 72 210 72 Q242 72 242 110" stroke="rgba(255,255,255,0.55)" strokeWidth="14" strokeLinecap="round" fill="none"/>
    <circle cx="192" cy="130" r="18" fill="rgba(255,255,255,0.18)" />
    <text x="210" y="155" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="20" fontWeight="bold" fontFamily="Georgia, serif">24</text>
    <text x="210" y="170" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Georgia, serif">KG</text>
    <text x="210" y="232" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="Georgia, serif" letterSpacing="3">ENDURANCE</text>
  </svg>
);

const slides = [
  {
    id: 0,
    label: 'Lift Heavier',
    sub: 'Track inventory & sales performance in real time',
    gradient: 'from-orange-600 via-orange-500 to-amber-400',
    illustration: <DumbbellIllustration />,
  },
  {
    id: 1,
    label: 'Push Harder',
    sub: 'Monitor transactions and revenue across every session',
    gradient: 'from-rose-600 via-rose-500 to-orange-400',
    illustration: <BarbelPressIllustration />,
  },
  {
    id: 2,
    label: 'Go Further',
    sub: 'Manage stock levels and never miss a low-supply alert',
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-400',
    illustration: <KettlebellIllustration />,
  },
];

interface GymHeroBannerProps {
  storeName?: string;
}

const GymHeroBanner: React.FC<GymHeroBannerProps> = ({ storeName = 'Muscle Matrix' }) => {
  const [current,   setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((p) => (p + 1) % slides.length);
        setAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-r ${slide.gradient} transition-all duration-700`}
      style={{ minHeight: 140, paddingBottom: '3rem' }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Clipped decorative layer */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-12 -left-6 w-36 h-36 rounded-full bg-white opacity-5" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">

        {/* Text side */}
        <div
          className="transition-all duration-300"
          style={{
            opacity:   animating ? 0 : 1,
            transform: animating ? 'translateX(-10px)' : 'translateX(0)',
          }}
        >
          <p className="text-white/60 text-[10px] font-semibold tracking-[0.2em] uppercase mb-1"
            style={{ fontFamily: 'Georgia, serif' }}>
            {storeName} — Admin
          </p>
          <h2
            className="text-white font-black leading-none mb-1.5"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}
          >
            {slide.label}
          </h2>
          <p className="text-white/70 text-xs max-w-xs leading-relaxed"
            style={{ fontFamily: 'Georgia, serif' }}>
            {slide.sub}
          </p>

          {/* Dots */}
          <div className="flex gap-1.5 mt-4">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === current ? 20 : 6,
                  height:     6,
                  background: i === current ? 'white' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div
          className="hidden md:block w-40 h-28 flex-shrink-0 transition-all duration-300"
          style={{
            opacity:   animating ? 0 : 1,
            transform: animating ? 'translateX(10px) scale(0.95)' : 'translateX(0) scale(1)',
          }}
        >
          {slide.illustration}
        </div>
      </div>
    </div>
  );
};

export default GymHeroBanner;