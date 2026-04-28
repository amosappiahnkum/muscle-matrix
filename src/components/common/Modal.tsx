import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open:        boolean;
  onClose?:    () => void;
  title?:      string;
  subtitle?:   string;
  icon?:       React.ReactNode;
  children:    React.ReactNode;
  maxWidth?:   'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Side panel rendered to the left of the form (landscape layout) */
  aside?:      React.ReactNode;
  /** If true, clicking the backdrop does NOT close */
  persistent?: boolean;
}

const maxWidthMap = {
  sm:  'max-w-sm',
  md:  'max-w-md',
  lg:  'max-w-lg',
  xl:  'max-w-xl',
  '2xl': 'max-w-2xl',
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'md',
  aside,
  persistent = false,
}) => {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, persistent]);

  if (!open) return null;

  const isLandscape = !!aside;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={() => !persistent && onClose?.()}
    >
      <div
        className={`w-full ${isLandscape ? 'max-w-3xl' : maxWidthMap[maxWidth]}
          bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden
          flex flex-col md:flex-row`}
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Aside panel (landscape left column) ── */}
        {aside && (
          <div className="hidden md:flex flex-col justify-between w-64 flex-shrink-0
            bg-gradient-to-b from-orange-500 to-orange-600 p-8 text-white">
            {aside}
          </div>
        )}

        {/* ── Main column ── */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          {(title || onClose) && (
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="bg-orange-50 border border-orange-100 p-2 rounded-xl">
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              {onClose && !persistent && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400
                    hover:text-gray-700 hover:bg-gray-100
                    transition-colors duration-150 ml-4 flex-shrink-0"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          {/* Body — scrollable */}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;