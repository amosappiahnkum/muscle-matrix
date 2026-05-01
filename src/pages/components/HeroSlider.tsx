import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { heroSlides } from '@/assets/images';

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);
  const total = heroSlides.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="relative overflow-hidden h-[520px] md:h-[600px] bg-gray-900">

      {/* ── Slides ─────────────────────────────────────────── */}
      {heroSlides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out
            ${i === current ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <img
            src={slide.src}
            alt={slide.label}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="w-full h-full object-cover brightness-[0.42]"
          />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
        </div>
      ))}

      {/* ── Content ────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-brand-orange text-white
          text-[11px] font-bold tracking-[2.5px] px-4 py-1.5 rounded-full mb-6">
          <Zap size={11} />
          SALES MANAGEMENT SYSTEM
        </div>

        {/* Title */}
        <h2 className="font-display font-black text-white leading-none tracking-[6px]
          text-[40px] sm:text-[56px] md:text-[72px] lg:text-[80px]
          mb-3 drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)] min-h-[1.1em]">
          {heroSlides[current].label}
        </h2>

        {/* Sub */}
        <p className="text-white/80 tracking-wide text-base md:text-lg min-h-[1.6em]">
          {heroSlides[current].sub}
        </p>
      </div>

      {/* ── Prev arrow ─────────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20
          w-11 h-11 rounded-full flex items-center justify-center
          bg-white/10 border border-white/25 text-white
          backdrop-blur-sm transition-all duration-200
          hover:bg-brand-orange hover:border-brand-orange"
      >
        <ChevronLeft size={20} />
      </button>

      {/* ── Next arrow ─────────────────────────────────────── */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20
          w-11 h-11 rounded-full flex items-center justify-center
          bg-white/10 border border-white/25 text-white
          backdrop-blur-sm transition-all duration-200
          hover:bg-brand-orange hover:border-brand-orange"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Dots ───────────────────────────────────────────── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full border-none cursor-pointer transition-all duration-300
              ${i === current
                ? 'w-7 bg-brand-orange'
                : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
          />
        ))}
      </div>

    </section>
  );
};

export default HeroSlider;