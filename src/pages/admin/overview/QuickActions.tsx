import React from 'react';
import { Users, Package, BarChart3, Download, KeyRound } from 'lucide-react';
import { TabType } from '../AdminDashboard.tsx';

interface QuickActionsProps {
    onNavigate: (tab: TabType) => void;
}

const actions = [
    { tab: 'employees' as TabType, label: 'Manage Employees', icon: Users,    color: 'text-blue-400' },
    { tab: 'products'  as TabType, label: 'Manage Products',  icon: Package,  color: 'text-green-400' },
    { tab: 'reports'   as TabType, label: 'View Reports',     icon: BarChart3, color: 'text-purple-400' },
    { tab: 'backup'    as TabType, label: 'Backup Data',      icon: Download, color: 'text-orange-400' },
];

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => (
    <div className="space-y-4">
        {/* Action grid */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map(({ tab, label, icon: Icon, color }) => (
                    <button
                        key={tab}
                        onClick={() => onNavigate(tab)}
                        className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 text-center transition-colors"
                    >
                        <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
                        <span className="text-white text-sm">{label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Change credentials banner */}
        <button
            onClick={() => onNavigate('credentials')}
            className="w-full bg-gradient-to-r from-purple-600/10 to-purple-800/10 border border-purple-600/30 rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/50 transition-colors text-left"
        >
            <div className="bg-purple-600/20 p-3 rounded-lg">
                <KeyRound className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
                <p className="text-white font-semibold">Change Admin Name &amp; Password</p>
                <p className="text-gray-400 text-sm">Update your admin login credentials securely</p>
            </div>
            <span className="text-purple-400 text-sm font-medium">Update →</span>
        </button>
    </div>
);

export default QuickActions;