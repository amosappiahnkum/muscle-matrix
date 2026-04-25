import React from 'react';
import { Dumbbell } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 border-t border-gray-800 mt-auto py-8 px-4">
    <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">

      {/* Logo mark */}
      <div className="bg-orange-500 w-9 h-9 rounded-lg flex items-center justify-center">
        <Dumbbell size={18} className="text-white" />
      </div>

      {/* Brand */}
      <p className="font-display font-black text-white tracking-[4px] text-lg uppercase">
        MUSCLE MATRIX
      </p>

      {/* Divider */}
      <div className="w-12 h-px bg-gray-700" />

      {/* Copy */}
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} MUSCLE MATRIX. All Rights Reserved.
      </p>
      <p className="text-xs text-gray-600">
        Sales Management System v2.0
      </p>

    </div>
  </footer>
);

export default Footer;