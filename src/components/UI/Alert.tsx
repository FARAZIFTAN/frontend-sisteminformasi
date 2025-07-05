import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { AlertType } from '../../types';

interface AlertProps {
  alert: AlertType;
  onClose: (id: string) => void;
}

const Alert: React.FC<AlertProps> = ({ alert, onClose }) => {
  const getAlertStyles = (type: AlertType['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: Info,
          iconColor: 'text-orange-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: Info,
          iconColor: 'text-gray-500'
        };
    }
  };

  const styles = getAlertStyles(alert.type);
  const Icon = styles.icon;

  return (
    <div className={`
      ${styles.bg} ${styles.border} ${styles.text} 
      border-2 rounded-xl p-4 mb-4 shadow-lg animate-in slide-in-from-top-1 duration-300 backdrop-blur-sm
    `}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${styles.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
        <button
          onClick={() => onClose(alert.id)}
          className={`ml-auto ${styles.iconColor} hover:opacity-70 transition-opacity p-1 rounded-lg hover:bg-white hover:bg-opacity-50`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Alert;