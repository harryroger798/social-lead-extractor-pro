import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

export const ToastContext = createContext<ToastContextType>({ toast: () => {} });
