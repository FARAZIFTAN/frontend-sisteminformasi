import React from 'react';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings,
  Home,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, adminOnly: false, description: 'Halaman utama sistem' },
    { id: 'activities', label: 'Kegiatan', icon: Calendar, adminOnly: false, description: 'Kelola kegiatan UKM' },
    { id: 'attendance', label: 'Kehadiran', icon: UserCheck, adminOnly: false, description: 'Sistem absensi digital' },
    { id: 'kategori', label: 'Kategori', icon: Settings, adminOnly: true, description: 'Kelola kategori UKM' },
    { id: 'members', label: 'Anggota', icon: Users, adminOnly: true, description: 'Manajemen anggota' },
    { id: 'statistics', label: 'Statistik', icon: BarChart3, adminOnly: true, description: 'Analytics & laporan' },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 z-40 w-80 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-sm shadow-2xl transform transition-all duration-300 ease-in-out border-r border-gray-100 overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:bg-white
      `}>
        {/* Navigation Menu */}
        <nav className="mt-8 px-4 pb-4">
          <div className="space-y-3">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`
                    group flex items-center w-full px-4 py-4 text-left rounded-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-lg shadow-orange-200'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                  )}
                  
                  <Icon className={`h-6 w-6 mr-4 transition-all duration-300 relative z-10 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  
                  <div className="flex-1 relative z-10">
                    <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-orange-100' : 'text-gray-500 group-hover:text-orange-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                  
                  <ChevronRight className={`h-4 w-4 transition-all duration-300 relative z-10 ${
                    isActive ? 'text-white rotate-90' : 'text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1'
                  }`} />
                </button>
              );
            })}
          </div>
          
          {/* User Profile Card */}
          <div className="mt-8 p-5 bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-2xl border border-orange-100 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{user?.name}</div>
                <div className="text-sm text-gray-600 truncate">{user?.email}</div>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  {user?.ukm}
                </div>
              </div>
            </div>
            
            {/* Role Badge */}
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                user?.role === 'admin' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
              }`}>
                {user?.role === 'admin' ? '👑 Administrator' : '👤 Member'}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-6 text-center">
            <div className="text-xs text-gray-500">
              ULBI UKM System v1.0
            </div>
            <div className="text-xs text-gray-400 mt-1">
              © 2025 ULBI Campus
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;