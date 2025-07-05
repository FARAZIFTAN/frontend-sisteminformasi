import React from 'react';
import { useAlert } from '../../contexts/AlertContext';
import Alert from './Alert';

const AlertContainer: React.FC = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      {alerts.map((alert) => (
        <Alert key={alert.id} alert={alert} onClose={removeAlert} />
      ))}
    </div>
  );
};

export default AlertContainer;