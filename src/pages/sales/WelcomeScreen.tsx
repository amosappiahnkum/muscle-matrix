import React, { useRef, useState } from 'react';
import { LogOut, ShoppingCart, User, Camera } from 'lucide-react';
import Button from '@/components/common/Button';

interface WelcomeScreenProps {
  type: 'wholesale' | 'retail';
  username: string;
  onStartSale: () => void;
  onLogout: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  type,
  username,
  onStartSale,
  onLogout,
}) => {
  const STORAGE_KEY = `muscle_matrix_logo_${type}`;

  const [logoSrc, setLogoSrc] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY) // ← restore on mount
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoSrc(result);
      localStorage.setItem(STORAGE_KEY, result); // ← persist
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoSrc(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const typeLabel    = type === 'wholesale' ? 'Wholesale' : 'Retail';
  const typeBadgeCls = type === 'wholesale'
    ? 'bg-blue-50 text-blue-600 border border-blue-200'
    : 'bg-green-50 text-green-600 border border-green-200';

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">

          {/* Logo upload slot + brand name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload your logo"
              className="relative group w-10 h-10 rounded-xl overflow-hidden border-2 border-dashed
                border-orange-300 hover:border-orange-500 bg-orange-50 flex items-center
                justify-center transition-colors"
            >
              {logoSrc ? (
                <>
                  <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                    flex items-center justify-center transition-opacity">
                    <Camera size={14} className="text-white" />
                  </div>
                </>
              ) : (
                <Camera size={16} className="text-orange-400 group-hover:text-orange-600 transition-colors" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">MUSCLE MATRIX</h1>
              <p className="text-gray-400 text-xs">{typeLabel} Portal</p>
            </div>
          </div>

          <Button
            variant="ghost"
            color="gray"
            size="sm"
            icon={<LogOut size={15} />}
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* User info strip */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <User size={22} className="text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-base font-semibold text-gray-900 truncate">{username}</p>
                <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${typeBadgeCls}`}>
                  {typeLabel} Employee
                </span>
              </div>
            </div>

            {/* CTA body */}
            <div className="px-6 py-10 text-center">

              <div className="mb-6 flex justify-center">
                {logoSrc ? (
                  <div className="relative group">
                    <img
                      src={logoSrc}
                      alt="Store logo"
                      className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-sm"
                    />
                    {/* Remove logo button */}
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full
                        text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity
                        flex items-center justify-center leading-none"
                      title="Remove logo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100
                    flex items-center justify-center text-4xl shadow-sm">
                    🏋️
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">Ready to Start Selling?</h2>
              <p className="text-gray-400 text-sm mb-8">
                Begin a new {type} transaction for your customer
              </p>

              <Button
                variant="primary"
                color="orange"
                size="lg"
                fullWidth
                icon={<ShoppingCart size={18} />}
                onClick={onStartSale}
              >
                Start Sale / Purchase
              </Button>
            </div>
          </div>

          {!logoSrc && (
            <p className="text-center text-xs text-gray-400 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="underline underline-offset-2 hover:text-orange-500 transition-colors"
              >
                Upload your store logo
              </button>{' '}
              to personalise this screen
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default WelcomeScreen;