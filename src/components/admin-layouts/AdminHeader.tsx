import React from 'react';
import { Menu, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { TabType } from '../../pages/admin/AdminDashboard.tsx';

interface AdminHeaderProps {
  activeTab:       TabType;
  username:        string;
  onToggleSidebar: () => void;
}

const tabLabels: Record<TabType, { title: string; subtitle: string }> = {
  overview:     { title: 'Dashboard Overview',        subtitle: 'Your business at a glance'         },
  employees:    { title: 'Employee Management',        subtitle: 'Manage staff accounts and roles'   },
  products:     { title: 'Product Management',         subtitle: 'Add, edit and manage products'     },
  inventory:    { title: 'Inventory Log',              subtitle: 'Track all stock movements'         },
  reports:      { title: 'Sales Reports',              subtitle: 'Revenue and performance reports'   },
  transactions: { title: 'Transaction History',        subtitle: 'Full record of all sales'          },
  backup:       { title: 'Backup & Restore',           subtitle: 'Export and import your data'       },
  credentials:  { title: 'Change Admin Credentials',   subtitle: 'Update your login details'         },
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  username,
  onToggleSidebar,
}) => {
  const { title, subtitle } = tabLabels[activeTab] ?? tabLabels.overview;

  return (
    // sticky top-0 keeps header pinned as page content scrolls
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3
      flex items-center gap-4 flex-shrink-0 shadow-sm">

      {/* Hamburger — uses lucide Menu icon for consistency */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100
          transition-colors flex-shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="min-w-0">
        <h2 className="text-base font-bold text-gray-900 truncate">{title}</h2>
        <p className="text-gray-400 text-xs mt-0.5">
          {subtitle} —{' '}
          <span className="text-orange-500 font-medium">{username}</span>
          {' · '}
          {format(new Date(), 'EEE, MMM dd yyyy')}
        </p>
      </div>

      {/* Branding */}
      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
        <div className="bg-orange-500 p-1.5 rounded-lg">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        <span className="text-gray-800 font-black tracking-widest text-sm hidden sm:block">
          MUSCLE MATRIX
        </span>
      </div>
    </header>
  );
};

export default AdminHeader;