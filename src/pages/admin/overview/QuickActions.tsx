import React from 'react';
import { Users, Package, BarChart3, Download, KeyRound } from 'lucide-react';
import { TabType } from '../AdminDashboard.tsx';

interface QuickActionsProps {
  onNavigate: (tab: TabType) => void;
}

const actions = [
  { tab: 'employees' as TabType, label: 'Manage Employees', icon: Users,    iconWrap: 'bg-blue-50 text-blue-500',   border: 'border-blue-100',   hover: 'hover:border-blue-300 hover:bg-blue-50' },
  { tab: 'products'  as TabType, label: 'Manage Products',  icon: Package,  iconWrap: 'bg-green-50 text-green-500', border: 'border-green-100',  hover: 'hover:border-green-300 hover:bg-green-50' },
  { tab: 'reports'   as TabType, label: 'View Reports',     icon: BarChart3, iconWrap: 'bg-purple-50 text-purple-500', border: 'border-purple-100', hover: 'hover:border-purple-300 hover:bg-purple-50' },
  { tab: 'backup'    as TabType, label: 'Backup Data',      icon: Download, iconWrap: 'bg-orange-50 text-orange-500', border: 'border-orange-100', hover: 'hover:border-orange-300 hover:bg-orange-50' },
];

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => (
  <div className="space-y-4">

    {/* Action grid */}
    <div className="bg-white rounded-xl p-5 border border-gray-200 ">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map(({ tab, label, icon: Icon, iconWrap, border, hover }) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className={`bg-white ${border} ${hover} border rounded-xl p-4 text-center
              transition-all duration-200 hover:shadow-sm`}
          >
            <div className={`${iconWrap} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5`}>
              <Icon size={20} />
            </div>
            <span className="text-gray-700 text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Change credentials banner */}
    <button
      onClick={() => onNavigate('credentials')}
      className="w-full bg-white border border-purple-200 rounded-xl p-4
        flex items-center gap-4 text-left 
        hover:border-purple-400 hover:shadow-md transition-all duration-200"
    >
      <div className="bg-purple-50 p-3 rounded-xl flex-shrink-0">
        <KeyRound size={20} className="text-purple-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-semibold text-sm">Change Admin Name &amp; Password</p>
        <p className="text-gray-400 text-xs mt-0.5">Update your admin login credentials securely</p>
      </div>
      <span className="text-purple-500 text-sm font-semibold flex-shrink-0">Update →</span>
    </button>

  </div>
);

export default QuickActions;