import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import Layout from './components/Layout/Layout';
import AlertContainer from './components/UI/AlertContainer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return (
      <div>
        <AlertContainer />
        {authMode === 'login' ? (
          <Login onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'activities':
        return <Activities />;
      case 'attendance':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kehadiran</h2>
            <p className="text-gray-600">Fitur kehadiran sedang dalam pengembangan.</p>
          </div>
        );
      case 'members':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manajemen Anggota</h2>
            <p className="text-gray-600">Fitur manajemen anggota sedang dalam pengembangan.</p>
          </div>
        );
      case 'statistics':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistik</h2>
            <p className="text-gray-600">Fitur statistik sedang dalam pengembangan.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pengaturan</h2>
            <p className="text-gray-600">Fitur pengaturan sedang dalam pengembangan.</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      <AlertContainer />
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;