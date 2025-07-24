import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  PieChart,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import Button from '../components/UI/Button';
import Select from '../components/UI/Select';

interface StatisticsData {
  totalKegiatan: number;
  totalAnggota: number;
  totalKehadiran: number;
  kegiatanByStatus: {
    upcoming: number;
    ongoing: number;
    completed: number;
    cancelled: number;
  };
  kegiatanByUkm: Array<{
    ukm: string;
    count: number;
    percentage: number;
  }>;
  membersByUkm: Array<{
    ukm: string;
    adminCount: number;
    memberCount: number;
    total: number;
  }>;
  recentActivities: Array<{
    title: string;
    ukm: string;
    date: string;
    attendees: number;
  }>;
}

const Statistics: React.FC = () => {
  const { user, token } = useAuth();
  const { addAlert } = useAlert();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedUkm, setSelectedUkm] = useState('all');

  const periodOptions = [
    { value: 'all', label: 'Semua Periode' },
    { value: 'thisMonth', label: 'Bulan Ini' },
    { value: 'lastMonth', label: 'Bulan Lalu' },
    { value: 'thisYear', label: 'Tahun Ini' },
    { value: 'lastYear', label: 'Tahun Lalu' }
  ];

  const [ukmOptions, setUkmOptions] = useState<{ value: string; label: string }[]>([{ value: 'all', label: 'Semua UKM' }]);

  useEffect(() => {
    fetch('http://backend-sisteminformasi-production.up.railway.app/kategori')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUkmOptions([{ value: 'all', label: 'Semua UKM' }, ...data.map((k: any) => ({ value: k.nama_kategori, label: k.nama_kategori }))]);
        }
      })
      .catch(() => setUkmOptions([{ value: 'all', label: 'Semua UKM' }]));
  }, []);

  const fetchStatistics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch statistics from dedicated endpoint
      const response = await fetch('http://backend-sisteminformasi-production.up.railway.app/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        addAlert({ type: 'error', message: 'Gagal mengambil data statistik' });
      }
    } catch {
      addAlert({ type: 'error', message: 'Terjadi kesalahan saat mengambil data statistik' });
    } finally {
      setLoading(false);
    }
  }, [token, addAlert]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUkmColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500'
    ];
    return colors[index % colors.length];
  };

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 mt-0">
      {/* Header dengan Background Orange */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10 rounded-2xl"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">Statistik & Analytics</h1>
              <p className="text-orange-100 text-lg mt-2">Analisis data kegiatan dan anggota UKM</p>
            </div>
            <Button 
              onClick={fetchStatistics} 
              disabled={loading} 
              className="mt-4 sm:mt-0 bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 border-2 border-orange-500 hover:border-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Memuat...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Periode"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
          />
          <Select
            label="UKM"
            value={selectedUkm}
            onChange={(e) => setSelectedUkm(e.target.value)}
            options={ukmOptions}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-orange-600 font-semibold">Memuat data statistik...</div>
        </div>
      ) : statistics ? (
        <>
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Kegiatan</p>
                  <p className="text-3xl font-bold">{statistics.totalKegiatan}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Anggota</p>
                  <p className="text-3xl font-bold">{statistics.totalAnggota}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Kehadiran</p>
                  <p className="text-3xl font-bold">{statistics.totalKehadiran}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Rata-rata Kehadiran</p>
                  <p className="text-3xl font-bold">
                    {statistics.totalKegiatan > 0 ? Math.round((statistics.totalKehadiran / statistics.totalKegiatan) * 100) / 100 : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <PieChart className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Status Kegiatan</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(statistics.kegiatanByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(status).split(' ')[1]}`}></div>
                      <span className="capitalize text-gray-700">
                        {status === 'upcoming' ? 'Akan Datang' : 
                         status === 'ongoing' ? 'Berlangsung' :
                         status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 mr-2">{count}</span>
                      <span className="text-sm text-gray-500">
                        ({statistics.totalKegiatan > 0 ? Math.round((count / statistics.totalKegiatan) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* UKM Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Kegiatan per UKM</h3>
              </div>
              <div className="space-y-4">
                {statistics.kegiatanByUkm.slice(0, 6).map((item, index) => (
                  <div key={item.ukm} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600 mr-4">{item.ukm}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                      <div 
                        className={`h-3 rounded-full ${getUkmColor(index)}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing UKM & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top UKM by Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <Award className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Top UKM Teraktif</h3>
              </div>
              <div className="space-y-4">
                {statistics.kegiatanByUkm.slice(0, 5).map((ukm, index) => (
                  <div key={ukm.ukm} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{ukm.ukm}</div>
                        <div className="text-sm text-gray-500">{ukm.count} kegiatan</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{ukm.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">dari total kegiatan</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Kegiatan Terbaru</h3>
              </div>
              <div className="space-y-4">
                {statistics.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-500">{activity.ukm}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.date).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{activity.attendees}</div>
                      <div className="text-xs text-gray-500">peserta</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members by UKM */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-gray-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Distribusi Anggota per UKM</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">UKM</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Admin</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Member</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.membersByUkm.map((ukm) => (
                    <tr key={ukm.ukm} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{ukm.ukm}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {ukm.adminCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {ukm.memberCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">{ukm.total}</td>
                      <td className="py-3 px-4 text-center">
                        {statistics.totalAnggota > 0 ? Math.round((ukm.total / statistics.totalAnggota) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500">Tidak ada data untuk ditampilkan</div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
