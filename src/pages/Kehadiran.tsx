import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import Button from '../components/UI/Button';

const Kehadiran: React.FC = () => {
  const { user, token } = useAuth();
  const { addAlert } = useAlert();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch('http://localhost:3000/kehadiran', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAttendance(data);
        } else {
          setAttendance([]);
        }
      })
      .catch(() => setAttendance([]))
      .finally(() => setLoading(false));
  }, [token]);

  // Filter attendance sesuai role dan UKM
  const filteredAttendance = attendance.filter((att) => {
    if (user?.role === 'admin') return true;
    return att.ukm === user?.ukm;
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Daftar Kehadiran</h1>
      {loading && <div className="text-orange-600">Memuat data kehadiran...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Kegiatan</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Peserta</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UKM</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waktu Absen</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-4">Belum ada data kehadiran.</td>
              </tr>
            ) : (
              filteredAttendance.map((att, idx) => (
                <tr key={idx} className="hover:bg-orange-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{att.kegiatan_nama || att.kegiatan_id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{att.user_nama || att.user_id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{att.ukm}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{att.waktu_cek ? new Date(att.waktu_cek).toLocaleString('id-ID') : '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{att.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Kehadiran;
