import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertType } from '../types';

interface AlertContextType {
  alerts: AlertType[];
  addAlert: (alert: Omit<AlertType, 'id'>) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const addAlert = useCallback((alert: Omit<AlertType, 'id'>) => {
    const newAlert: AlertType = {
      ...alert,
      id: Date.now().toString()
    };
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto remove after duration
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, alert.duration || 3000);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};