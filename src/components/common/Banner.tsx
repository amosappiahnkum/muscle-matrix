import React from 'react';
import { Alert } from 'antd';

interface BannerProps {
  message:    string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<BannerProps> = ({ message, onDismiss }) => (
  <Alert
    type="error"
    message={message}
    showIcon
    closable={!!onDismiss}
    onClose={onDismiss}
    style={{ borderRadius: 8 }}
  />
);

export const SuccessBanner: React.FC<BannerProps> = ({ message, onDismiss }) => (
  <Alert
    type="success"
    message={message}
    showIcon
    closable={!!onDismiss}
    onClose={onDismiss}
    style={{ borderRadius: 8 }}
  />
);