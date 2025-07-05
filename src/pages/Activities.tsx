import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { Activity } from '../types';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Modal from '../components/UI/Modal';

// Mock data
const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Turnamen Futsal Antar UKM',
    description: 'Kompetisi futsal untuk mempererat tali persaudaraan antar UKM di lingkungan ULBI',
    date: '2024-01-15',
    time: '09:00',
    location: 'Lapangan Futsal ULBI',
    category: 'olahraga',
    ukm: 'UKM Futsal',
    status: 'upcoming',
    createdBy: '1',
    attendees: ['1', '2'],
    maxParticipants: 20,
    documentation: 'https://drive.google.com/file/example'
  },
  {
    id: '2',
    title: 'Workshop Fotografi Landscape',
    description: 'Belajar teknik fotografi landscape untuk pemula hingga menengah',
    date: '2024-01-18',
    time: '14:00',
    location: 'Studio Fotografi ULBI',
    category: 'seni',
    ukm: 'UKM Fotografi',
    status: 'upcoming',
    createdBy: '1',
    attendees: ['1'],
    maxParticipants: 15
  },
  {
    id: '3',
    title: 'Bakti Sosial Desa Sukamaju',
    description: 'Kegiatan berbagi dengan masyarakat sekitar kampus',
    date: '2024-01-10',
    time: '08:00',
    location: 'Desa Sukamaju',
    category: 'sosial',
    ukm: 'UKM Pecinta Alam',
    status: 'completed',
    createdBy: '1',
    attendees: ['1', '2'],
    maxParticipants: 25
  }
];

const Activities: React.FC = () => {
  const { user } = useAuth();
  const { addAlert } = useAlert();
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ukmFilter, setUkmFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isFormMode, setIsFormMode] = useState<'create' | 'edit' | 'view'>('view');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'sosial' as Activity['category'],
    ukm: user?.ukm || '',
    maxParticipants: '',
    documentation: ''
  });

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'upcoming', label: 'Akan Datang' },
    { value: 'ongoing', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  const ukmOptions = [
    { value: '', label: 'Semua UKM' },
    { value: 'UKM Futsal', label: 'UKM Futsal' },
    { value: 'UKM Basket', label: 'UKM Basket' },
    { value: 'UKM Fotografi', label: 'UKM Fotografi' },
    { value: 'UKM Pecinta Alam', label: 'UKM Pecinta Alam' }
  ];

  const categoryOptions = [
    { value: 'sosial', label: 'Sosial' },
    { value: 'seni', label: 'Seni' },
    { value: 'olahraga', label: 'Olahraga' },
    { value: 'akademik', label: 'Akademik' }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || activity.status === statusFilter;
    const matchesUKM = !ukmFilter || activity.ukm === ukmFilter;
    
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

  const getCategoryBadge = (category: Activity['category']) => {
    switch (category) {
      case 'sosial':
        return 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800';
      case 'seni':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800';
      case 'olahraga':
        return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800';
      case 'akademik':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
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
      category: 'sosial',
      ukm: user?.ukm || '',
      maxParticipants: '',
      documentation: ''
    });
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsFormMode('view');
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsFormMode('edit');
    setFormData({
      title: activity.title,
      description: activity.description,
      date: activity.date,
      time: activity.time,
      location: activity.location,
      category: activity.category,
      ukm: activity.ukm,
      maxParticipants: activity.maxParticipants?.toString() || '',
      documentation: activity.documentation || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      addAlert({
        type: 'success',
        message: 'Kegiatan berhasil dihapus'
      });
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFormMode === 'create') {
      const newActivity: Activity = {
        id: Date.now().toString(),
        ...formData,
        status: 'upcoming',
        createdBy: user?.id || '',
        attendees: [],
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined
      };
      
      setActivities(prev => [...prev, newActivity]);
      addAlert({
        type: 'success',
        message: 'Kegiatan berhasil dibuat'
      });
    } else if (isFormMode === 'edit' && selectedActivity) {
      const updatedActivity: Activity = {
        ...selectedActivity,
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined
      };
      
      setActivities(prev => prev.map(activity => 
        activity.id === selectedActivity.id ? updatedActivity : activity
      ));
      addAlert({
        type: 'success',
        message: 'Kegiatan berhasil diperbarui'
      });
    }
    
    setIsModalOpen(false);
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
        
        <Select
          label="Kategori"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Activity['category'] }))}
          options={categoryOptions}
        />
        
        <Input
          label="UKM"
          type="text"
          value={formData.ukm}
          onChange={(e) => setFormData(prev => ({ ...prev, ukm: e.target.value }))}
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
        <Button type="submit">
          {isFormMode === 'create' ? 'Buat Kegiatan' : 'Perbarui Kegiatan'}
        </Button>
      </div>
    </form>
  );

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
              {selectedActivity?.attendees.length}/{selectedActivity?.maxParticipants || 'Unlimited'} peserta
            </span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedActivity?.status || 'upcoming')}`}>
              {getStatusText(selectedActivity?.status || 'upcoming')}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-700">Kategori:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(selectedActivity?.category || 'sosial')}`}>
              {selectedActivity?.category}
            </span>
          </div>
        </div>
      </div>
      
      {selectedActivity?.documentation && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
          <span className="text-sm font-medium text-gray-700">Dokumentasi:</span>
          <a
            href={selectedActivity.documentation}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 text-sm font-semibold ml-2 hover:underline"
          >
            Lihat Dokumentasi
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Kegiatan</h1>
          <p className="text-gray-600 mt-2">Atur dan pantau semua kegiatan UKM</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={handleCreateActivity} className="mt-4 sm:mt-0" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Tambah Kegiatan
          </Button>
        )}
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
            options={ukmOptions}
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
                  {activity.attendees.length}/{activity.maxParticipants || '∞'} peserta
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-orange-600">{activity.ukm}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewActivity(activity)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleEditActivity(activity)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
    </div>
  );
};

export default Activities;