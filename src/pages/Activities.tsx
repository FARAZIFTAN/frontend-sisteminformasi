import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Calendar,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { Activity } from '../types';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Modal from '../components/UI/Modal';

const Activities: React.FC = () => {
  // State untuk konfirmasi delete
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Handler Edit
  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsFormMode('edit');
    setFormData({
      title: activity.title || '',
      description: activity.description || '',
      date: activity.date || '',
      time: activity.time || '',
      location: activity.location || '',
      ukm: activity.ukm || '',
      maxParticipants: activity.maxParticipants !== undefined && activity.maxParticipants !== null ? activity.maxParticipants.toString() : '',
      documentation: activity.documentation || ''
    });
    setIsModalOpen(true);
  };

  // Handler Delete
  const handleDeleteActivity = (activityId: string) => {
    setDeleteConfirmId(activityId);
  };

  // Proses Delete
  const confirmDeleteActivity = async () => {
    if (!token || !deleteConfirmId) return;
    setDeleteLoadingId(deleteConfirmId);
    try {
      const res = await fetch(`http://localhost:3000/kegiatan/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus kegiatan');
      }
      await fetchActivities();
      addAlert({ type: 'success', message: 'Kegiatan berhasil dihapus' });
      setDeleteConfirmId(null);
    } catch (err: any) {
      addAlert({ type: 'error', message: err.message || 'Gagal menghapus kegiatan' });
    } finally {
      setDeleteLoadingId(null);
    }
  };
  const { user, token } = useAuth();
  const { addAlert } = useAlert();
  
  // Log status user dan token untuk debugging
  useEffect(() => {
    console.log("User:", user);
    console.log("Token tersedia:", !!token);
  }, [user, token]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ukmFilter, setUkmFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isFormMode, setIsFormMode] = useState<'create' | 'edit' | 'view'>('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    ukm: '',
    maxParticipants: '',
    documentation: '' // kembalikan field documentation
  });

  // Fetch kategori dari backend, tapi gunakan sebagai UKM
  const [ukmOptions, setUkmOptions] = useState<{ value: string; label: string }[]>([]);
  
  useEffect(() => {
    const fetchUkmOptions = async () => {
      if (!token) return;
      
      try {
        const res = await fetch('http://localhost:3000/kategori', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setUkmOptions(data.map((k: { nama_kategori: string }) => ({ 
              value: k.nama_kategori, 
              label: k.nama_kategori 
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching UKM options:', error);
        setUkmOptions([]);
      }
    };

    fetchUkmOptions();
  }, [token]);

  // Fungsi fetchActivities tunggal dan konsisten
  const fetchActivities = async () => {
    // Cek apakah user login dan token tersedia
    if (!user || !token) {
      console.log("User atau token tidak tersedia, tidak melakukan fetch");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/kegiatan', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengambil data kegiatan');
      }
      const data = await res.json();
      setActivities(data.map((item: any) => {
        // Mapping field dengan fallback dan normalisasi tipe data
        return {
          id: item.id || item._id || item.id_kegiatan || '',
          title: item.judul || item.title || '',
          description: item.deskripsi || item.description || '',
          date: item.tanggal || item.date || '',
          time: item.waktu || item.time || '',
          location: item.lokasi || item.location || '',
          ukm: item.kategori || item.ukm || '',
          maxParticipants: typeof item.maxParticipants === 'number' ? item.maxParticipants : (parseInt(item.maxParticipants) || ''),
          documentation: item.dokumentasi_url || item.documentation || '',
          status: item.status || '',
          attendees: Array.isArray(item.attendees) ? item.attendees : [],
        };
      }));
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data kegiatan');
      addAlert({ type: 'error', message: err.message || 'Gagal mengambil data kegiatan' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchActivities();
    // eslint-disable-next-line
  }, [token]);

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'upcoming', label: 'Akan Datang' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  // Ambil UKM unik dari data kegiatan
  type UkmOption = { value: string; label: string };
  const [uniqueUkmOptions, setUniqueUkmOptions] = useState<UkmOption[]>([{ value: '', label: 'Semua UKM' }]);
  useEffect(() => {
    const uniqueUKM = Array.from(new Set(activities.map((a) => a.ukm).filter(Boolean)));
    setUniqueUkmOptions([{ value: '', label: 'Semua UKM' }, ...uniqueUKM.map((ukm) => ({ value: ukm, label: ukm }))]);
  }, [activities]);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch =
      ((activity.title ? activity.title : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.description ? activity.description : '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || activity.status === statusFilter;
    const matchesUKM = !ukmFilter || activity.ukm === ukmFilter;
    // Semua user (admin dan user biasa) bisa melihat semua kegiatan dari semua UKM
    return matchesSearch && matchesStatus && matchesUKM;
  });

  const getStatusBadge = (status: Activity['status']) => {
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

  const getStatusText = (status: Activity['status']) => {
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

  const handleCreateActivity = () => {
    setIsFormMode('create');
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      ukm: '',
      maxParticipants: '',
      documentation: '' // kembalikan field documentation
    });
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsFormMode('view');
    setIsModalOpen(true);
  };

  // const handleEditActivity = (activity: Activity) => {
  //   setSelectedActivity(activity);
  //   setIsFormMode('edit');
  //   setFormData({
  //     title: activity.title || '',
  //     description: activity.description || '',
  //     date: activity.date || '',
  //     time: activity.time || '',
  //     location: activity.location || '',
  //     ukm: activity.ukm || '',
  //     maxParticipants: activity.maxParticipants !== undefined && activity.maxParticipants !== null ? activity.maxParticipants.toString() : '',
  //     documentation: activity.documentation || ''
  //   });
  //   setIsModalOpen(true);
  // };

  // const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  // ...fungsi fetchActivities sudah didefinisikan di atas, hapus duplikasi...

  // const handleDeleteActivity = async (activityId: string) => {
  //   if (!token) return;
  //   if (window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
  //     setDeleteLoadingId(activityId);
  //     try {
  //       const res = await fetch(`http://localhost:3000/kegiatan/${activityId}`, {
  //         method: 'DELETE',
  //         headers: {
  //           'Authorization': `Bearer ${token}`
  //         }
  //       });
  //       if (!res.ok) {
  //         const data = await res.json();
  //         throw new Error(data.error || 'Gagal menghapus kegiatan');
  //       }
  //       await fetchActivities();
  //       addAlert({
  //         type: 'success',
  //         message: 'Kegiatan berhasil dihapus'
  //       });
  //     } catch (err: any) {
  //       addAlert({ type: 'error', message: err.message || 'Gagal menghapus kegiatan' });
  //     } finally {
  //       setDeleteLoadingId(null);
  //     }
  //   }
  // };

  const [submitLoading, setSubmitLoading] = useState(false);
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    // Validasi sederhana
    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time || !formData.location || !formData.ukm) {
      addAlert({ type: 'error', message: 'Semua field wajib diisi!' });
      return;
    }
    setSubmitLoading(true);
    try {
      // Siapkan body request tanpa field undefined/null
      const body: any = {
        judul: formData.title, // title -> judul
        deskripsi: formData.description, // description -> deskripsi
        tanggal: formData.date, // date -> tanggal
        waktu: formData.time, // time -> waktu
        lokasi: formData.location, // location -> lokasi
        kategori: formData.ukm,
        dokumentasi_url: formData.documentation
      };
      if (formData.maxParticipants && !isNaN(Number(formData.maxParticipants))) {
        body.maxParticipants = parseInt(formData.maxParticipants);
      }
      if (isFormMode === 'create') {
        // Tambahkan status default untuk kegiatan baru
        body.status = 'upcoming'; 
        
        console.log("Mengirim data kegiatan baru:", body);
        console.log("Token:", token);
        
        const res = await fetch('http://localhost:3000/kegiatan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        
        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Response data:", data);
        
        if (!res.ok) {
          console.log('BACKEND ERROR:', data);
          addAlert({ type: 'error', message: data.error || JSON.stringify(data) || 'Gagal membuat kegiatan' });
          throw new Error(data.error || 'Gagal membuat kegiatan');
        }
        await fetchActivities();
        addAlert({ type: 'success', message: 'Kegiatan berhasil dibuat' });
      } else if (isFormMode === 'edit' && selectedActivity) {
        const res = await fetch(`http://localhost:3000/kegiatan/${selectedActivity.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
          console.log('BACKEND ERROR:', data);
          addAlert({ type: 'error', message: data.error || JSON.stringify(data) || 'Gagal memperbarui kegiatan' });
          throw new Error(data.error || 'Gagal memperbarui kegiatan');
        }
        await fetchActivities();
        addAlert({ type: 'success', message: 'Kegiatan berhasil diperbarui' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      addAlert({ type: 'error', message: err.message || 'Gagal memproses kegiatan' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderActivityForm = () => (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Judul Kegiatan"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            required
            placeholder="Deskripsi kegiatan"
          />
        </div>
        
        <Input
          label="Tanggal"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
        
        <Input
          label="Waktu"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
          required
        />
        
        <Input
          label="Lokasi"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          required
        />
        
        <Input
          label="Maksimal Peserta"
          type="number"
          value={formData.maxParticipants}
          onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
          placeholder="Kosongkan jika tidak terbatas"
        />
        
        <div className="md:col-span-2">
          <Select
            label="UKM"
            value={formData.ukm}
            onChange={(e) => setFormData(prev => ({ ...prev, ukm: e.target.value }))}
            options={ukmOptions}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Link Dokumentasi"
            type="url"
            value={formData.documentation}
            onChange={(e) => setFormData(prev => ({ ...prev, documentation: e.target.value }))}
            placeholder="https://drive.google.com/..."
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(false)}
        >
          Batal
        </Button>
        <Button type="submit" loading={submitLoading} disabled={submitLoading}>
          {isFormMode === 'create' ? 'Buat Kegiatan' : 'Perbarui Kegiatan'}
        </Button>
      </div>
    </form>
  );

  const [absenLoading, setAbsenLoading] = useState(false);
  const [absenSuccess, setAbsenSuccess] = useState(false);
  const handleAbsen = async () => {
    if (!token || !user || !selectedActivity) {
      addAlert({ type: 'error', message: 'User atau kegiatan tidak valid.' });
      return;
    }
    if (!selectedActivity.id || !user.id) {
      addAlert({ type: 'error', message: 'ID user atau kegiatan kosong.' });
      return;
    }
    // Validasi UKM user dan kegiatan
    if (user.ukm !== selectedActivity.ukm) {
      addAlert({ type: 'error', message: 'Anda hanya bisa absen pada kegiatan UKM yang sesuai dengan UKM Anda.' });
      return;
    }
    setAbsenLoading(true);
    try {
      // Cek jika sudah absen (berdasarkan attendees)
      if (Array.isArray(selectedActivity.attendees) && selectedActivity.attendees.includes(user.id)) {
        addAlert({ type: 'info', message: 'Anda sudah absen pada kegiatan ini.' });
        setAbsenLoading(false);
        setAbsenSuccess(true);
        return;
      }

      const absenData = {
        kegiatan_id: selectedActivity.id,
        user_id: user.id,
        status: 'hadir', // sesuai validasi backend
        waktu_cek: new Date().toISOString() // waktu absen
      };

      console.log('Sending attendance data:', absenData);
      console.log('Selected Activity:', selectedActivity);
      console.log('User:', user);
      
      const res = await fetch('http://localhost:3000/kehadiran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(absenData)
      });
      
      console.log('Attendance response status:', res.status);
      
      let data: any = {};
      try {
        data = await res.json();
        console.log('Attendance response data:', data);
      } catch (e) {
        console.error('Error parsing attendance response:', e);
      }
      
      if (!res.ok) {
        console.error('Attendance creation failed:', data);
        addAlert({ type: 'error', message: (data && data.error) ? data.error : `Gagal absen (${res.status}). Pastikan data yang dikirim sudah benar dan id tidak kosong.` });
        throw new Error((data && data.error) ? data.error : 'Gagal absen');
      }
      
      setAbsenSuccess(true);
      addAlert({ type: 'success', message: 'Absen berhasil!' });
      // Update attendees di UI (optimistic update)
      setActivities(prev => prev.map(act => act.id === selectedActivity.id ? { ...act, attendees: [...(act.attendees || []), user.id] } : act));
    } catch (err: any) {
      addAlert({ type: 'error', message: err.message || 'Gagal absen' });
    } finally {
      setAbsenLoading(false);
    }
  };

  const renderActivityDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {selectedActivity?.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {selectedActivity?.description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-orange-50 rounded-xl">
            <Calendar className="h-5 w-5 text-orange-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">
              {selectedActivity && new Date(selectedActivity.date).toLocaleDateString('id-ID')}
            </span>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-xl">
            <Clock className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">
              {selectedActivity?.time}
            </span>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-xl">
            <MapPin className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">
              {selectedActivity?.location}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-purple-50 rounded-xl">
            <Users className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">
              {(Array.isArray(selectedActivity?.attendees) ? selectedActivity.attendees.length : 0)}/{selectedActivity?.maxParticipants || 'Unlimited'} peserta
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedActivity?.status || 'upcoming')}`}>
              {getStatusText(selectedActivity?.status || 'upcoming')}
            </span>
          </div>
          {/* Daftar kehadiran dan statistik telah dipindahkan ke halaman Kehadiran */}
        </div>
      </div>
      {/* Tombol absen untuk user non-admin */}
      {user && user.role !== 'admin' && selectedActivity && (
        <div className="pt-4">
          <Button
            onClick={handleAbsen}
            loading={absenLoading}
            disabled={absenSuccess || (Array.isArray(selectedActivity.attendees) && selectedActivity.attendees.includes(user.id))}
            className="w-full"
          >
            {absenSuccess || (Array.isArray(selectedActivity.attendees) && selectedActivity.attendees.includes(user.id)) ? 'Sudah Absen' : 'Absen Sekarang'}
          </Button>
        </div>
      )}
    </div>
  );

  // Jika tidak ada user atau token, tampilkan pesan
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Anda harus login untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 mt-0">
      {loading && (
        <div className="text-center text-orange-600 font-semibold">Memuat data kegiatan...</div>
      )}
      {error && (
        <div className="text-center text-red-600 font-semibold">{error}</div>
      )}
      
      {/* Header dengan Background Orange */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10 rounded-2xl"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">Kelola Kegiatan</h1>
              <p className="text-orange-100 text-lg mt-2">Atur dan pantau semua kegiatan UKM</p>
            </div>
            {user?.role === 'admin' && (
              <Button 
                onClick={handleCreateActivity} 
                className="mt-4 sm:mt-0 bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 border-2 border-orange-500 hover:border-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kegiatan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari kegiatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          
          <Select
            value={ukmFilter}
            onChange={(e) => setUkmFilter(e.target.value)}
            options={uniqueUkmOptions}
          />
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {activity.description}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(activity.status)} ml-2`}>
                  {getStatusText(activity.status)}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                  {new Date(activity.date).toLocaleDateString('id-ID')} • {activity.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                  {activity.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-orange-500" />
                  {(Array.isArray(activity.attendees) ? activity.attendees.length : 0)}/{activity.maxParticipants || '∞'} peserta
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-orange-600">{activity.ukm}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewActivity(activity)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Lihat Detail Kegiatan"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleEditActivity(activity)}
                        className="p-2 text-blue-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit Kegiatan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V17h4" /></svg>
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Hapus Kegiatan"
                        disabled={deleteLoadingId === activity.id}
                      >
                        {deleteLoadingId === activity.id ? (
                          <span className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full inline-block"></span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit & Detail */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isFormMode === 'create' ? 'Buat Kegiatan Baru' :
          isFormMode === 'edit' ? 'Edit Kegiatan' :
          'Detail Kegiatan'
        }
        size="lg"
      >
        {isFormMode === 'view' ? renderActivityDetails() : renderActivityForm()}
      </Modal>

      {/* Modal Konfirmasi Delete */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Hapus Kegiatan"
          size="sm"
        >
          <div className="space-y-4">
            <p>Apakah Anda yakin ingin menghapus kegiatan ini?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={deleteLoadingId === deleteConfirmId}>Batal</Button>
              <Button variant="danger" onClick={confirmDeleteActivity} loading={deleteLoadingId === deleteConfirmId} disabled={deleteLoadingId === deleteConfirmId}>Hapus</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Activities;