import React from 'react';
import {
  Dumbbell, Users, Package, BarChart3,
  LogOut, FileText, ShoppingCart, Download, KeyRound,
  ClipboardList, ReceiptText, Truck, Tag,
} from 'lucide-react';
import { TabType } from '../../pages/admin/AdminDashboard';
import { User } from '../../types';

interface AdminSidebarProps {
  activeTab:   TabType;
  open:        boolean;
  user:        User | null;
  onTabChange: (tab: TabType) => void;
  onLogout:    () => void;
}

interface MenuItem {
  id:    TabType;
  label: string;
  icon:  React.FC<{ className?: string }>;
}

interface MenuGroup {
  label:  string;
  items:  MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'General',
    items: [
      { id: 'overview',     label: 'Overview',          icon: BarChart3    },
      { id: 'employees',    label: 'Employees',          icon: Users        },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { id: 'products',     label: 'Products',           icon: Package      },
      { id: 'inventory',    label: 'Inventory',          icon: ClipboardList },
      { id: 'suppliers',    label: 'Suppliers',          icon: Truck        },
      { id: 'categories',   label: 'Categories',         icon: Tag          },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'expenses',     label: 'Expenses',           icon: ReceiptText  },
      { id: 'transactions', label: 'Transactions',       icon: ShoppingCart },
      { id: 'reports',      label: 'Sales Reports',      icon: BarChart3    },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'backup',       label: 'Backup & Restore',   icon: Download     },
      { id: 'credentials',  label: 'Change Credentials', icon: KeyRound     },
    ],
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab, open, user, onTabChange, onLogout,
}) => (
  <aside
    className={`${
      open ? 'w-64' : 'w-16'
    } fixed top-0 left-0 h-screen bg-gray-900 border-r border-gray-800
      flex flex-col transition-all duration-300 flex-shrink-0 z-30`}
  >
    {/* ── Logo ───────────────────────────────────────────────────────── */}
    <div className="flex-shrink-0 px-4 py-5 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="bg-orange-500 p-2 rounded-xl flex-shrink-0 shadow-md">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        {open && (
          <div className="overflow-hidden">
            <h1 className="text-white font-black text-sm tracking-widest uppercase">
              Muscle Matrix
            </h1>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        )}
      </div>
    </div>

    {/* ── Nav ─────────────────────────────────────────────────────────── */}
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
      {menuGroups.map((group) => (
        <div key={group.label}>
          {/* Group label — hidden when collapsed */}
          {open && (
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              {group.label}
            </p>
          )}

          {/* Divider line when collapsed */}
          {!open && (
            <div className="mx-3 mb-1 border-t border-gray-800" />
          )}

          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = activeTab === item.id;
              const activeClass = item.id === 'credentials'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-700/40'
                : 'bg-orange-500/20 text-orange-300 border border-orange-600/30';

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={!open ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-150 relative
                    ${isActive
                      ? activeClass
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? '' : 'opacity-70'}`} />
                  {open && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {!open && isActive && (
                    <span className="absolute left-11 w-1.5 h-1.5 rounded-full bg-orange-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>

    {/* ── Footer ──────────────────────────────────────────────────────── */}
    <div className="flex-shrink-0 px-2 py-3 border-t border-gray-800 space-y-2">
      {open && user && (
        <div className="bg-gray-800 rounded-xl px-3 py-2.5">
          <p className="text-white font-semibold text-sm truncate">{user.username}</p>
          <p className="text-gray-500 text-xs capitalize">{user.role}</p>
        </div>
      )}
      <button
        onClick={onLogout}
        title="Logout"
        className={`
          w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
          bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors
          ${open ? 'justify-start' : 'justify-center'}
        `}
      >
        <LogOut className="w-4 h-4 flex-shrink-0" />
        {open && <span className="text-sm font-medium">Logout</span>}
      </button>
    </div>
  </aside>
);

export default AdminSidebar;