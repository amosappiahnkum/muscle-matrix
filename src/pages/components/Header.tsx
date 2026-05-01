import React from 'react';
import { Dumbbell, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-100 py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">

        {/* Left icon */}
        <div className="bg-orange-50 border border-orange-100 p-2 rounded-xl flex-shrink-0">
          <Dumbbell size={20} className="text-orange-500" />
        </div>

        {/* Brand text */}
        <div className="text-center flex-1">
          <h1 className="font-display font-black text-gray-900 tracking-[4px] uppercase text-xl sm:text-2xl leading-none">
            MUSCLE MATRIX
          </h1>
          <p className="text-gray-400 text-xs mt-0.5 tracking-wide">
            Premium Gym Products &amp; Supplements
          </p>
        </div>

        {/* Login button */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex-shrink-0 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600
            active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-lg
            transition-all duration-150"
        >
          <LogIn size={14} />
          <span className="hidden sm:inline">Login</span>
        </button>

      </div>
    </header>
  );
};

export default Header;