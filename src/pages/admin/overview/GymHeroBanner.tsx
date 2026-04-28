import React from 'react';

interface GymHeroBannerProps {
  storeName?: string;
}

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

const GymHeroBanner: React.FC<GymHeroBannerProps> = ({ storeName = 'Muscle Matrix' }) => (
  <div className="relative rounded-xl bg-orange-500 overflow-hidden" style={{ minHeight: 140 }}>

    {/* Subtle decorative circles */}
    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white opacity-5 pointer-events-none" />
    <div className="absolute -bottom-12 -left-6 w-36 h-36 rounded-full bg-white opacity-5 pointer-events-none" />

    {/* Content */}
    <div className="relative z-10 flex items-center justify-between px-6 py-5">

      {/* Text */}
      <div>
        <p className="text-orange-100 text-[10px] font-semibold tracking-[0.2em] uppercase mb-1">
          {storeName} — Admin
        </p>
        <h2
          className="text-white font-black leading-none mb-1.5"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}
        >
          Lift Heavier
        </h2>
        <p className="text-orange-100 text-xs max-w-xs leading-relaxed">
          Track inventory &amp; sales performance in real time
        </p>
      </div>

      {/* Illustration */}
      <div className="hidden md:block w-40 h-28 flex-shrink-0">
        <DumbbellIllustration />
      </div>

    </div>
  </div>
);

export default GymHeroBanner;