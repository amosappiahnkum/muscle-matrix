import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, Store, ShoppingBag, ChevronRight, LucideIcon } from 'lucide-react';

interface Portal {
  role:  string;
  title: string;
  desc:  string;
  icon:  LucideIcon;
  color: 'purple' | 'blue' | 'green';
  badge: string;
}

const PORTALS: Portal[] = [
  {
    role:  'admin',
    title: 'Admin Dashboard',
    desc:  'Manage employees, products, view reports, and system settings',
    icon:  UserCog,
    color: 'purple',
    badge: 'Admin Access',
  },
  {
    role:  'wholesale',
    title: 'Wholesale Portal',
    desc:  'Bulk sales and wholesale pricing for business customers',
    icon:  Store,
    color: 'blue',
    badge: 'Bulk Pricing',
  },
  {
    role:  'retail',
    title: 'Retail Portal',
    desc:  'Individual sales and retail pricing for walk-in customers',
    icon:  ShoppingBag,
    color: 'green',
    badge: 'Walk-in Sales',
  },
];

const PortalCards: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 border-t border-gray-200 py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="font-display text-[11px] font-bold tracking-[4px] text-orange-500 uppercase mb-1">
            Portals
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-wide text-gray-900">
            Choose Your Access Point
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PORTALS.map(({ role, title, desc, icon: Icon, color, badge }) => (
            <button
              key={role}
              onClick={() => navigate(`/login/${role}`)}
              className={`portal-card--${color}
                bg-white text-left rounded-2xl border border-gray-200 p-7
                flex flex-col gap-3 cursor-pointer
                shadow-sm hover:-translate-y-1 hover:shadow-xl
                transition-all duration-250`}
            >
              {/* Icon row */}
              <div className="flex items-start justify-between">
                <div className={`portal-card__icon--${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon size={22} />
                </div>
                <ChevronRight
                  size={18}
                  className="portal-card__arrow text-gray-300 transition-all duration-200"
                />
              </div>

              {/* Text */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>

              {/* Badge — color from CSS */}
              <span className={`portal-card__badge--${color} self-start text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full`}>
                {badge}
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PortalCards;