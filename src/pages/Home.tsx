import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell, Phone, Mail, ShoppingBag, Store,
  Shield, UserCog, ChevronRight, AlertTriangle, Zap,
} from 'lucide-react';

// ─── Portal config — add/remove portals here only ────────────────────────────
const PORTALS = [
  {
    role:      'admin',
    title:     'Admin Dashboard',
    desc:      'Manage employees, products, view reports, and system settings',
    icon:      UserCog,
    gradient:  'from-purple-600 to-purple-800',
    hover:     'hover:from-purple-500 hover:to-purple-700 hover:shadow-purple-500/25',
    border:    'border-purple-500/30',
    textMuted: 'text-purple-200',
  },
  {
    role:      'wholesale',
    title:     'Wholesale Portal',
    desc:      'Bulk sales and wholesale pricing for business customers',
    icon:      Store,
    gradient:  'from-blue-600 to-blue-800',
    hover:     'hover:from-blue-500 hover:to-blue-700 hover:shadow-blue-500/25',
    border:    'border-blue-500/30',
    textMuted: 'text-blue-200',
  },
  {
    role:      'retail',
    title:     'Retail Portal',
    desc:      'Individual sales and retail pricing for walk-in customers',
    icon:      ShoppingBag,
    gradient:  'from-green-600 to-green-800',
    hover:     'hover:from-green-500 hover:to-green-700 hover:shadow-green-500/25',
    border:    'border-green-500/30',
    textMuted: 'text-green-200',
  },
] as const;

const RULES = [
  'Employees must log in with assigned credentials only',
  'No price manipulation allowed',
  'All sales must be recorded through the system',
  'Do not share login credentials',
  'Always verify product quantities before sale',
  'Receipts must be issued for every transaction',
  'Admin approval required for edits/deletions',
  'Maintain professionalism with customers',
];

const ATHLETE_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop', label: 'MUSCLE MATRIX' },
  { src: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop', label: 'STRENGTH' },
  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop', label: 'POWER' },
  { src: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&h=500&fit=crop', label: 'DEDICATION' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const navigate = useNavigate();

  // ← Single redirect function used by every portal card
  const goToLogin = (role: string) => navigate(`/login/${role}`);

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">

        {/* Header */}
        <header className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 py-6 px-4 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white p-3 rounded-full shadow-lg">
                <Dumbbell className="w-10 h-10 text-orange-600" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase">
                  MUSCLE MATRIX
                </h1>
                <p className="text-orange-200 text-sm md:text-base mt-1 tracking-wide">
                  Premium Gym Products &amp; Supplements
                </p>
              </div>
              <div className="bg-white p-3 rounded-full shadow-lg">
                <Zap className="w-10 h-10 text-orange-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Contact bar */}
        <div className="bg-gray-800/50 border-b border-gray-700 py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-orange-500" />
              <span>0245349937</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-4 h-4 text-orange-500" />
              <span>emmanueleshun558@gmail.com</span>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8">

          {/* Hero */}
          <div className="relative mb-10 rounded-2xl overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
            <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='%23f97316' fill-opacity='0.3'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />
            <div className="relative p-8 md:p-12 text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {ATHLETE_IMAGES.map((img) => (
                    <div key={img.label} className="relative group">
                      <img
                          src={img.src}
                          alt={img.label}
                          className="w-full h-48 md:h-64 object-cover rounded-xl border-2 border-orange-600/50 shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <span className="text-white font-bold text-sm">{img.label}</span>
                      </div>
                    </div>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Sales Management System
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Complete point-of-sale solution for managing wholesale and retail transactions,
                inventory tracking, and sales reporting for MUSCLE MATRIX.
              </p>
            </div>
          </div>

          {/* Portal cards — all driven by PORTALS config above */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {PORTALS.map(({ role, title, desc, icon: Icon, gradient, hover, border, textMuted }) => (
                <button
                    key={role}
                    onClick={() => goToLogin(role)}
                    className={`group bg-gradient-to-br ${gradient} ${hover} ${border} rounded-xl p-6 text-left transition-all duration-300 shadow-lg border`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className={`${textMuted} text-sm`}>{desc}</p>
                </button>
            ))}
          </div>

          {/* Rules & Regulations */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600/20 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Rules &amp; Regulations</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-3">
                {RULES.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-300 text-sm">{rule}</p>
                    </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <p className="text-yellow-200 text-sm">
                  Violation of these rules may result in disciplinary action or termination.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-6 px-4 mt-10">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MUSCLE MATRIX. All Rights Reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">Sales Management System v2.0</p>
          </div>
        </footer>
      </div>
  );
};

export default Home;