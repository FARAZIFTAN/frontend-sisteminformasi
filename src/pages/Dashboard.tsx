import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  TrendingUp,
  Clock,
  MapPin,
  Eye,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Activity as ActivityType } from '../types';

// Mock data for demonstration
// ...existing code...

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('https://backend-sisteminformasi-production.up.railway.app/kegiatan', {
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActivities(data.map((item: any) => ({
            id: item.id || item._id || item.id_kegiatan || '',
            title: item.judul || item.title || '',
            description: item.deskripsi || item.description || '',
            date: item.tanggal || item.date || '',
            time: item.waktu || item.time || '',
            location: item.lokasi || item.location || '',
            ukm: item.kategori || item.ukm || '',
            status: item.status || '',
            attendees: Array.isArray(item.attendees) ? item.attendees : [],
            maxParticipants: typeof item.maxParticipants === 'number' ? item.maxParticipants : (parseInt(item.maxParticipants) || ''),
            category: item.kategori || item.ukm || '',
            createdBy: item.createdBy || '',
          })));
        } else {
          setActivities([]);
        }
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter kegiatan sesuai role
  const visibleActivities = user?.role === 'admin'
    ? activities
    : activities.filter(a => a.ukm === user?.ukm);

  const stats = [
    {
      name: 'Total Kegiatan',
      value: visibleActivities.length,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Kegiatan Mendatang',
      value: visibleActivities.filter(a => a.status === 'upcoming').length,
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Kegiatan Selesai',
      value: visibleActivities.filter(a => a.status === 'completed').length,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      change: '+15%',
      changeType: 'increase'
    },
    {
      name: 'Total Peserta',
      value: visibleActivities.reduce((acc, activity) => acc + (Array.isArray(activity.attendees) ? activity.attendees.length : 0), 0),
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      change: '+23%',
      changeType: 'increase'
    }
  ];

  const getStatusBadge = (status: ActivityType['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200';
      case 'ongoing':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200';
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200';
    }
  };

  const getStatusText = (status: ActivityType['status']) => {
    switch (status) {
      case 'upcoming':
        return 'Akan Datang';
      case 'ongoing':
        return 'Berlangsung';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-8 p-6 mt-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10 rounded-2xl"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Selamat datang, {user?.name}! 👋
          </h1>
          <p className="text-orange-100 text-lg">
            Kelola kegiatan UKM Anda dengan mudah dan efisien
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-xl text-sm font-medium">
            <Activity className="h-4 w-4 mr-2" />
            {user?.ukm}
          </div>
        </div>
      </div>

      {/* Stats Cards - Hanya untuk Admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-3`}>
                    <Icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Kegiatan Terbaru
            </h2>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-semibold hover:underline transition-colors">
              Lihat Semua
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading && <div className="text-orange-600">Memuat data kegiatan...</div>}
          {error && <div className="text-red-600">{error}</div>}
          <div className="space-y-4">
            {visibleActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{activity.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(activity.status)}`}>
                        {getStatusText(activity.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{activity.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                        {new Date(activity.date).toLocaleDateString('id-ID')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                        {activity.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                        {activity.location}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">UKM:</span>
                        <span className="text-sm font-semibold text-orange-600">{activity.ukm}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {Array.isArray(activity.attendees) ? activity.attendees.length : 0}/{activity.maxParticipants || '∞'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="ml-4 p-3 text-gray-400 hover:text-orange-600 rounded-xl hover:bg-orange-50 transition-colors" title="Lihat Detail Kegiatan">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Aksi Cepat
        </h2>
        <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          {user?.role === 'admin' && (
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 active:bg-orange-100 active:border-orange-400 transition-all duration-200 text-left group transform hover:-translate-y-1 active:translate-y-0">
              <Calendar className="h-8 w-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Buat Kegiatan</h3>
              <p className="text-xs text-gray-600">Tambah kegiatan baru untuk UKM</p>
            </button>
          )}
          
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 active:bg-green-100 active:border-green-400 transition-all duration-200 text-left group transform hover:-translate-y-1 active:translate-y-0">
            <UserCheck className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">Absen Kegiatan</h3>
            <p className="text-xs text-gray-600">Tandai kehadiran peserta</p>
          </button>
          
          {user?.role === 'admin' && (
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 active:bg-purple-100 active:border-purple-400 transition-all duration-200 text-left group transform hover:-translate-y-1 active:translate-y-0">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Lihat Statistik</h3>
              <p className="text-xs text-gray-600">Analisis kegiatan UKM</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;