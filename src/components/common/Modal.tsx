import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open:        boolean;
  onClose?:    () => void;
  title?:      string;
  children:    React.ReactNode;
  maxWidth?:   'sm' | 'md' | 'lg';
  /** If true, clicking the backdrop does NOT close */
  persistent?: boolean;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'md',
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/40 backdrop-blur-sm"
      onClick={() => !persistent && onClose?.()}
    >
      <div
        className={`w-full ${maxWidthMap[maxWidth]} bg-white rounded-2xl
          border border-gray-200 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && (
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            )}
            {onClose && !persistent && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400
                  hover:text-gray-700 hover:bg-gray-100
                  transition-colors duration-150 ml-auto"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;