import React, { useState } from 'react';
import Kehadiran from './pages/Kehadiran';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import Layout from './components/Layout/Layout';
import AlertContainer from './components/UI/AlertContainer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Members from './pages/Members';
import Statistics from './pages/Statistics';
import KategoriPage from './pages/Kategori';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'activities':
        return <Activities />;
      case 'attendance':
        return <Kehadiran />;
      case 'kategori':
        // Hanya admin yang dapat mengakses kategori
        if (user?.role !== 'admin') {
          return (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Akses Ditolak</h2>
              <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            </div>
          );
        }
        return <KategoriPage />;
      case 'members':
        return <Members />;
      case 'statistics':
        return <Statistics />;
      case 'settings':
        // Hanya admin yang dapat mengakses pengaturan
        if (user?.role !== 'admin') {
          return (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Akses Ditolak</h2>
              <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            </div>
          );
        }
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
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};


function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <AlertContainer />
        <AppContent />
      </AlertProvider>
    </AuthProvider>
  );
}
// Jika Anda mengalami error net::ERR_INSUFFICIENT_RESOURCES pada icon lucide-react,
// lakukan langkah berikut di terminal pada folder project ini:
// 1. Tutup tab browser yang tidak perlu dan restart browser.
// 2. Jalankan:
//    rmdir /s /q node_modules
//    del package-lock.json
//    npm install
// 3. Pastikan koneksi internet stabil dan tidak ada error lain di console.
// 4. Jika masih error, restart komputer Anda.
//
// Ini bukan bug pada kode App.tsx, tapi masalah resource/instalasi dependency di sistem Anda.

export default App;