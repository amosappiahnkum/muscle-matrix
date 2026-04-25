import React from 'react';
import { Dumbbell, Zap } from 'lucide-react';

const Header: React.FC = () => (
<header className="header py-6 px-4">
<div className="max-w-6xl mx-auto flex items-center justify-center gap-4">

      {/* Left icon */}
      <div className="bg-white p-3 rounded-full shadow-lg flex-shrink-0">
        <Dumbbell size={28} className="text-orange-500" />
      </div>

      {/* Brand text */}
      <div className="text-center">
        <h1 className="font-display font-black text-white tracking-[6px] uppercase
          text-3xl sm:text-4xl md:text-5xl leading-none">
          MUSCLE MATRIX
        </h1>
        <p className="text-orange-200 text-sm md:text-base mt-1 tracking-wide">
          Premium Gym Products &amp; Supplements
        </p>
      </div>

      {/* Right icon */}
      <div className="bg-white p-3 rounded-full shadow-lg flex-shrink-0">
        <Zap size={28} className="text-orange-500" />
      </div>

    </div>
  </header>
);

export default Header;