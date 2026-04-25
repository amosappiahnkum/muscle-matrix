import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Lock, User, AlertCircle, Dumbbell, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '@/assets/images';

type PortalRole = 'admin' | 'wholesale' | 'retail';

const portalConfig: Record<PortalRole, {
  title: string;
  subtitle: string;
  successPath: string;
}> = {
  admin: {
    title:       'Admin Login',
    subtitle:    'Management Portal',
    successPath: '/admin',
  },
  wholesale: {
    title:       'Wholesale Portal',
    subtitle:    'Wholesale Employee Login',
    successPath: '/wholesale',
  },
  retail: {
    title:       'Retail Portal',
    subtitle:    'Retail Employee Login',
    successPath: '/retail',
  },
};

/* ── Image slider shown on the right panel ───────────────── */
const LoginSlider: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);
  const total = heroSlides.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">

      {/* Slides */}
      {heroSlides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out
            ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={slide.src}
            alt={slide.label}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      {/* Slide label */}
      <div className="absolute bottom-16 left-0 right-0 px-8 z-10 text-center">
        <h3 className="font-display font-black text-white text-4xl tracking-[5px] mb-2">
          {heroSlides[current].label}
        </h3>
        <p className="text-white/70 text-sm tracking-wide">
          {heroSlides[current].sub}
        </p>
      </div>

      {/* Prev / Next */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 rounded-full flex items-center justify-center
          bg-white/10 border border-white/20 text-white
          hover:bg-white/25 transition-all duration-200"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 rounded-full flex items-center justify-center
          bg-white/10 border border-white/20 text-white
          hover:bg-white/25 transition-all duration-200"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full border-none cursor-pointer transition-all duration-300
              ${i === current ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>

    </div>
  );
};

/* ── Main Login page ─────────────────────────────────────── */
const Login: React.FC = () => {
  const { role }                         = useParams<{ role: string }>();
  const navigate                         = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = portalConfig[user.role as PortalRole]?.successPath ?? '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!role || !(role in portalConfig)) return <Navigate to="/" replace />;

  const portalRole    = role as PortalRole;
  const config        = portalConfig[portalRole];
  const expectedRole: UserRole | undefined = portalRole !== 'admin' ? portalRole : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await login(username.trim(), password, expectedRole);
      if (!result.success) setError(result.message);
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex flex-col md:flex-row bg-white">

      {/* ── LEFT: Form ───────────────────────────────────────── */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-6 py-12 sm:px-10 lg:px-14 bg-white order-2 md:order-1">

        <div className="w-full max-w-sm mx-auto">
        {/* Logo + portal label */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`login-panel--${portalRole} w-11 h-11 rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
            <Dumbbell size={22} className="text-white" />
          </div>
          <div>
            <p className="font-display font-black text-gray-900 tracking-[3px] text-lg leading-none">
              MUSCLE MATRIX
            </p>
            <p className="text-xs text-gray-400 tracking-wide mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display font-extrabold text-gray-900 text-3xl sm:text-4xl tracking-wide mb-1">
          {config.title}
        </h1>
        <p className="text-gray-400 text-sm mb-8">Enter your credentials to continue</p>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-red-600">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                placeholder="Enter username"
                className={`login-input--${portalRole}
                  w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                  bg-gray-50 text-gray-900 placeholder-gray-400 text-sm
                  focus:outline-none focus:bg-white transition-all disabled:opacity-50`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                placeholder="Enter password"
                className={`login-input--${portalRole}
                  w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200
                  bg-gray-50 text-gray-900 placeholder-gray-400 text-sm
                  focus:outline-none focus:bg-white transition-all disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`login-btn--${portalRole}
              w-full py-3 rounded-xl text-white font-semibold text-sm tracking-wide
              shadow-md transition-opacity disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in…
              </>
            ) : (
              `Sign in to ${config.title}`
            )}
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-gray-200 bg-white
              text-gray-500 text-sm font-medium hover:bg-gray-50 hover:text-gray-700
              transition-colors disabled:opacity-50"
          >
            ← Back to Home
          </button>

        </form>

        </div>

        {portalRole !== 'admin' && (
          <p className="text-center text-gray-400 text-xs mt-6">
            Contact your admin if you have trouble logging in.
          </p>
        )}
      </div>

      {/* ── RIGHT: Slider (stacks on top on mobile) ──────────── */}
      <div className="w-full md:w-1/2 h-64 sm:h-80 md:h-auto md:min-h-screen order-1 md:order-2">
        <LoginSlider />
      </div>

    </div>
  );

};

export default Login;