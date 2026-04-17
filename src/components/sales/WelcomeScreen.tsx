import React from 'react';
import { Dumbbell, LogOut, ShoppingCart, User } from 'lucide-react';
import Button from '../common/Button.tsx';

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
  const headerGradient = type === 'wholesale' ? 'from-blue-600 to-blue-700' : 'from-green-600 to-green-700';
  const userBg   = type === 'wholesale' ? 'bg-blue-500/20' : 'bg-green-500/20';
  const userText = type === 'wholesale' ? 'text-blue-400' : 'text-green-400';
  const sectionBg = type === 'wholesale' ? 'from-blue-600/20 to-blue-700/20' : 'from-green-600/20 to-green-700/20';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className={`bg-gradient-to-r ${headerGradient} py-4 px-6 shadow-lg`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-7 h-7 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-wider">MUSCLE MATRIX</h1>
              <p className="text-white/70 text-xs capitalize">{type} Portal</p>
            </div>
          </div>
          <Button
            variant="ghost"
            color="gray"
            size="sm"
            icon={<LogOut className="w-4 h-4" />}
            onClick={onLogout}
            className="text-white hover:bg-white/20"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          {/* Employee info */}
          <div className={`bg-gradient-to-r ${sectionBg} p-6 border-b border-gray-700`}>
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${userBg}`}>
                <User className={`w-10 h-10 ${userText}`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Logged in as</p>
                <h2 className="text-2xl font-bold text-white">{username}</h2>
                <p className={`text-sm capitalize font-medium ${userText}`}>
                  {type} Employee
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="p-10 text-center">
            <div className="text-6xl mb-6">🏋️</div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Start Selling?</h3>
            <p className="text-gray-400 mb-8 text-sm">
              Begin a new {type} transaction for your customer
            </p>
            <Button
              variant="primary"
              color={type === 'wholesale' ? 'blue' : 'green'}
              size="lg"
              icon={<ShoppingCart className="w-5 h-5" />}
              onClick={onStartSale}
              className="mx-auto"
            >
              Start Sale / Purchase
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
