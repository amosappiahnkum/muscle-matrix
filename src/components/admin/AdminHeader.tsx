import React from 'react';
import { Zap } from 'lucide-react';
import { format } from 'date-fns';
import { TabType } from './AdminDashboard';

interface AdminHeaderProps {
    activeTab: TabType;
    username: string;
    onToggleSidebar: () => void;
}

const tabLabels: Record<TabType, string> = {
    overview:     'Dashboard Overview',
    employees:    'Employee Management',
    products:     'Product Management',
    reports:      'Sales Reports',
    transactions: 'Transaction History',
    backup:       'Backup & Restore',
    credentials:  'Change Admin Credentials',
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
                                                     activeTab,
                                                     username,
                                                     onToggleSidebar,
                                                 }) => (
    <header className="bg-gray-800/50 border-b border-gray-700 px-4 py-3 flex items-center gap-4 flex-shrink-0">
        {/* Hamburger */}
        <button
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0"
            aria-label="Toggle sidebar"
        >
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
        </button>

        {/* Title */}
        <div>
            <h2 className="text-xl font-bold text-white">{tabLabels[activeTab]}</h2>
            <p className="text-gray-400 text-xs mt-0.5">
                Welcome back,{' '}
                <span className="text-orange-400 font-medium">{username}</span>! —{' '}
                {format(new Date(), 'EEEE, MMMM dd yyyy')}
            </p>
        </div>

        {/* Branding */}
        <div className="ml-auto flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="text-orange-400 font-black tracking-wider text-sm hidden sm:block">
        MUSCLE MATRIX
      </span>
        </div>
    </header>
);

export default AdminHeader;