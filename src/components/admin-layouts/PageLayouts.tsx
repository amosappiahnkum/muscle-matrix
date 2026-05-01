type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const PageLayout = ({ title, subtitle, icon, actions, children }: Props) => {
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-gray-400 text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default PageLayout;