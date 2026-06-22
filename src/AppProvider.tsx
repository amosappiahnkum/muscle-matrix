// Wrap your app root (main.tsx or App.tsx) with this provider.
// It sets the Ant Design JS token layer so ALL components —
// including portals, modals, dropdowns, and message toasts —
// use your brand orange instead of Ant's default blue.

import React from 'react';
import { ConfigProvider } from 'antd';

const antTheme = {
  token: {
    colorPrimary:       '#f97316',
    colorPrimaryHover:  '#ea6c0a',
    colorPrimaryActive: '#c2560d',
    colorLink:          '#f97316',
    colorLinkHover:     '#ea6c0a',
    borderRadius:       8,
    borderRadiusLG:     12,
    borderRadiusSM:     6,
  },
  components: {
    Button: {
      primaryColor:       '#ffffff',
      defaultBorderColor: '#e5e7eb',
    },
    Input: {
      activeBorderColor:  '#f97316',
      hoverBorderColor:   '#fdba74',
      activeShadow:       '0 0 0 2px rgba(249,115,22,0.15)',
    },
    Select: {
      optionSelectedBg:   '#fff7ed',
      optionActiveBg:     '#fff7ed',
    },
    DatePicker: {
      activeBorderColor:  '#f97316',
      hoverBorderColor:   '#fdba74',
      activeShadow:       '0 0 0 2px rgba(249,115,22,0.15)',
      cellActiveWithRangeBg: '#ffedd5',
    },
    Checkbox: {
      colorPrimary:       '#f97316',
      colorPrimaryHover:  '#ea6c0a',
    },
    Pagination: {
      itemActiveBg:       '#f97316',
      colorPrimary:       '#f97316',
      colorPrimaryHover:  '#ea6c0a',
    },
    Spin: {
      colorPrimary:       '#f97316',
    },
    Table: {
      colorPrimary:       '#f97316',
    },
  },
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => (
  <ConfigProvider theme={antTheme}>
    {children}
  </ConfigProvider>
);