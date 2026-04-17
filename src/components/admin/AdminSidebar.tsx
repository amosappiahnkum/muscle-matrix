// src/components/admin/AdminSidebar.tsx
import React from 'react';
import {
    Dumbbell,
    Users,
    Package,
    BarChart3,
    LogOut,
    FileText,
    ShoppingCart,
    Download,
    KeyRound,
} from 'lucide-react';
import { TabType } from './AdminDashboard';
import { User } from '../../types';

interface AdminSidebarProps {
    activeTab: TabType;
    open: boolean;
    user: User | null;
    onTabChange: (tab: TabType) => void;
    onLogout: () => void;
}

const menuItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview',     label: 'Overview',            icon: BarChart3 },
    { id: 'employees',    label: 'Employees',            icon: Users },
    { id: 'products',     label: 'Products',             icon: Package },
    { id: 'reports',      label: 'Sales Reports',        icon: FileText },
    { id: 'transactions', label: 'Transactions',         icon: ShoppingCart },
    { id: 'backup',       label: 'Backup & Restore',     icon: Download },
    { id: 'credentials',  label: 'Change Credentials',   icon: KeyRound },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
                                                       activeTab,
                                                       open,
                                                       user,
                                                       onTabChange,
                                                       onLogout,
                                                   }) => (
    <aside
        className={`${open ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 flex-shrink-0`}
    >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-lg flex-shrink-0">
                    <Dumbbell className="w-6 h-6 text-white" />
                </div>
                {open && (
                    <div>
                        <h1 className="text-white font-black text-sm tracking-wider">MUSCLE MATRIX</h1>
                        <p className="text-gray-400 text-xs">Admin Panel</p>
                    </div>
                )}
            </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const activeColor =
                    item.id === 'credentials' ? 'bg-purple-600 text-white' : 'bg-orange-600 text-white';

                return (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        title={!open ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                            isActive ? activeColor : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {open && <span className="text-sm">{item.label}</span>}
                    </button>
                );
            })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-gray-700">
            {open && user && (
                <div className="bg-gray-700/50 rounded-lg p-3 mb-2">
                    <p className="text-white font-medium text-sm truncate">{user.username}</p>
                    <p className="text-gray-400 text-xs capitalize">{user.role}</p>
                </div>
            )}
            <button
                onClick={onLogout}
                title="Logout"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
            >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {open && <span className="text-sm">Logout</span>}
            </button>
        </div>
    </aside>
);

export default AdminSidebar;