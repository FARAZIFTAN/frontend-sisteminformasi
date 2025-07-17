import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import Button from '../components/UI/Button';

interface KehadiranData {
  id: string;
  user_id: string;
  kegiatan_id: string;
  status: string;
  waktu_cek: string;
  user_nama?: string;
  kegiatan_nama?: string;
  ukm?: string;
}

const Kehadiran: React.FC = () => {
  const { user, token } = useAuth();
  const { addAlert } = useAlert();
  const [attendance, setAttendance] = useState<KehadiranData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching attendance data...');
      const response = await fetch('http://localhost:3000/kehadiran', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Received data:', data);
      
      if (response.ok) {
        if (Array.isArray(data)) {
          setAttendance(data);
        } else {
          console.error('Data is not an array:', data);
          setAttendance([]);
        }
      } else {
        setError(data.error || 'Gagal mengambil data kehadiran');
        setAttendance([]);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Terjadi kesalahan saat mengambil data kehadiran');
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [token]);

  // Filter attendance sesuai role dan UKM
  const filteredAttendance = attendance.filter((att) => {
    if (user?.role === 'admin') return true;
    return att.ukm === user?.ukm;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Kehadiran</h1>
          <p className="text-gray-600 mt-2">Monitor kehadiran peserta pada setiap kegiatan</p>
        </div>
        <Button onClick={fetchAttendance} disabled={loading}>
          {loading ? 'Memuat...' : 'Refresh Data'}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-orange-600 font-semibold">Memuat data kehadiran...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-red-800 font-medium">Error:</div>
          <div className="text-red-600">{error}</div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Kegiatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Peserta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UKM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu Absen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    {loading ? 'Memuat data...' : 'Belum ada data kehadiran.'}
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((att, idx) => (
                  <tr key={att.id || idx} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.kegiatan_nama || att.kegiatan_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.user_nama || att.user_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.ukm || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.waktu_cek 
                        ? new Date(att.waktu_cek).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        att.status === 'hadir' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {att.status === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredAttendance.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Total: {filteredAttendance.length} data kehadiran
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kehadiran;
