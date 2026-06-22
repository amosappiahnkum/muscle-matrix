import React from 'react';
import { Modal as AntModal } from 'antd';

interface ModalProps {
  open:        boolean;
  onClose?:    () => void;
  title?:      string;
  subtitle?:   string;
  icon?:       React.ReactNode;
  children:    React.ReactNode;
  maxWidth?:   'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Side panel rendered to the left of the form (landscape layout) */
  aside?:      React.ReactNode;
  /** If true, clicking the backdrop does NOT close */
  persistent?: boolean;
}

const maxWidthPxMap: Record<NonNullable<ModalProps['maxWidth']>, number> = {
  sm:    384,
  md:    448,
  lg:    512,
  xl:    576,
  '2xl': 672,
  '3xl': 768,
  '4xl': 896,
  '5xl': 1024,
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth  = 'md',
  aside,
  persistent = false,
}) => {
  const isLandscape = !!aside;
  const widthPx = isLandscape
    ? Math.max(maxWidthPxMap[maxWidth], maxWidthPxMap['4xl'])
    : maxWidthPxMap[maxWidth];

  // Custom title node — icon + title + subtitle
  const titleNode = (title || icon) ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon && (
        <div style={{
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: 12,
          padding: '6px 8px',
          display: 'flex',
          alignItems: 'center',
        }}>
          {icon}
        </div>
      )}
      <div>
        {title && (
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>
            {title}
          </div>
        )}
        {subtitle && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <AntModal
      open={open}
      onCancel={persistent ? undefined : onClose}
      width={widthPx}
      title={titleNode}
      footer={null}
      closable={!persistent && !!onClose}
      maskClosable={!persistent}
      keyboard={!persistent}
      styles={{
        content: {
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
        header: {
          padding: '20px 24px',
          borderBottom: '1px solid #f3f4f6',
          marginBottom: 0,
          flexShrink: 0,
        },
        body: {
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          padding: 0,
        },
        mask: {
          backdropFilter: 'blur(4px)',
          background: 'rgba(0,0,0,0.4)',
        },
      }}
    >
      {/* Aside panel */}
      {aside && (
        <div style={{
          width: 256,
          flexShrink: 0,
          // background: 'linear-gradient(to bottom, #f97316, #ea6c0a)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#fff',
        }}>
          {aside}
        </div>
      )}

      {/* Main body — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {children}
      </div>
    </AntModal>
  );
};

export default Modal;