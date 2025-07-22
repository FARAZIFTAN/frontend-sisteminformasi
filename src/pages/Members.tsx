import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2,
  User,
  Mail,
  Shield,
  Users,
  UserPlus,
  UserMinus,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Modal from '../components/UI/Modal';

interface Member {
  id: string;
  nama: string;
  email: string;
  role: 'admin' | 'member';
  ukm: string;
}

const Members: React.FC = () => {
  const { user, token } = useAuth();
  const { addAlert } = useAlert();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [ukmFilter, setUkmFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isFormMode, setIsFormMode] = useState<'create' | 'edit' | 'view'>('view');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'member' as 'admin' | 'member',
    ukm: ''
  });

  const roleOptions = [
    { value: '', label: 'Semua Role' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' }
  ];

  const [ukmOptions, setUkmOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'Semua UKM' }]);

  useEffect(() => {
    fetch('http://localhost:3000/kategori')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUkmOptions([{ value: '', label: 'Semua UKM' }, ...data.map((k: any) => ({ value: k.nama_kategori, label: k.nama_kategori }))]);
        }
      })
      .catch(() => setUkmOptions([{ value: '', label: 'Semua UKM' }]));
  }, []);

  const fetchMembers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMembers(data);
      } else {
        addAlert({ type: 'error', message: data.error || 'Gagal mengambil data anggota' });
      }
    } catch (error) {
      addAlert({ type: 'error', message: 'Terjadi kesalahan saat mengambil data anggota' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesUkm = !ukmFilter || member.ukm === ukmFilter;
    return matchesSearch && matchesRole && matchesUkm;
  });

  const handleCreateMember = () => {
    setIsFormMode('create');
    setFormData({
      nama: '',
      email: '',
      password: '',
      role: 'member',
      ukm: ''
    });
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsFormMode('view');
    setIsModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsFormMode('edit');
    setFormData({
      nama: member.nama,
      email: member.email,
      password: '',
      role: member.role,
      ukm: member.ukm
    });
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!token || !window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) return;
    
    setDeleteLoading(memberId);
    try {
      const response = await fetch(`http://localhost:3000/users/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await fetchMembers();
        addAlert({ type: 'success', message: 'Anggota berhasil dihapus' });
      } else {
        const data = await response.json();
        addAlert({ type: 'error', message: data.error || 'Gagal menghapus anggota' });
      }
    } catch (error) {
      addAlert({ type: 'error', message: 'Terjadi kesalahan saat menghapus anggota' });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validasi
    if (!formData.nama.trim() || !formData.email.trim() || !formData.ukm) {
      addAlert({ type: 'error', message: 'Semua field wajib diisi!' });
      return;
    }

    if (isFormMode === 'create' && !formData.password.trim()) {
      addAlert({ type: 'error', message: 'Password wajib diisi untuk anggota baru!' });
      return;
    }

    setSubmitLoading(true);
    try {
      const body = {
        nama: formData.nama,
        email: formData.email,
        role: formData.role,
        ukm: formData.ukm,
        ...(formData.password && { password: formData.password })
      };

      if (isFormMode === 'create') {
        const response = await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          await fetchMembers();
          addAlert({ type: 'success', message: 'Anggota berhasil ditambahkan' });
          setIsModalOpen(false);
        } else {
          const data = await response.json();
          addAlert({ type: 'error', message: data.error || 'Gagal menambahkan anggota' });
        }
      } else if (isFormMode === 'edit' && selectedMember) {
        const response = await fetch(`http://localhost:3000/users/${selectedMember.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          await fetchMembers();
          addAlert({ type: 'success', message: 'Anggota berhasil diperbarui' });
          setIsModalOpen(false);
        } else {
          const data = await response.json();
          addAlert({ type: 'error', message: data.error || 'Gagal memperbarui anggota' });
        }
      }
    } catch (error) {
      addAlert({ type: 'error', message: 'Terjadi kesalahan saat memproses data anggota' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200';
      case 'member':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return 'Unknown';
    }
  };

  const renderMemberForm = () => (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nama Lengkap"
          type="text"
          value={formData.nama}
          onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
          required
        />
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        
        <Input
          label={isFormMode === 'create' ? 'Password' : 'Password Baru (kosongkan jika tidak diubah)'}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required={isFormMode === 'create'}
        />
        
        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
          options={[
            { value: 'member', label: 'Member' },
            { value: 'admin', label: 'Admin' }
          ]}
          required
        />
        
        <div className="md:col-span-2">
          <Select
            label="UKM"
            value={formData.ukm}
            onChange={(e) => setFormData(prev => ({ ...prev, ukm: e.target.value }))}
            options={ukmOptions.filter(opt => opt.value !== '')}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsModalOpen(false)}
        >
          Batal
        </Button>
        <Button
          type="submit"
          loading={submitLoading}
        >
          {isFormMode === 'create' ? 'Tambah Anggota' : 'Perbarui Anggota'}
        </Button>
      </div>
    </form>
  );

  const renderMemberDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedMember?.nama}
        </h3>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadge(selectedMember?.role || '')}`}>
          {getRoleText(selectedMember?.role || '')}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
          <Mail className="h-5 w-5 text-gray-600 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-500">Email</div>
            <div className="text-gray-900">{selectedMember?.email}</div>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
          <Users className="h-5 w-5 text-gray-600 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-500">UKM</div>
            <div className="text-gray-900">{selectedMember?.ukm}</div>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
          <Shield className="h-5 w-5 text-gray-600 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-500">Role</div>
            <div className="text-gray-900">{getRoleText(selectedMember?.role || '')}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Cek akses admin
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
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">Manajemen Anggota</h1>
              <p className="text-orange-100 text-lg mt-2">Kelola data anggota UKM</p>
            </div>
            <Button 
              onClick={handleCreateMember} 
              className="mt-4 sm:mt-0 bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 border-2 border-orange-500 hover:border-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Anggota
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Anggota</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-3">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-3">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Member</p>
              <p className="text-2xl font-bold text-gray-900">
                {members.filter(m => m.role === 'member').length}
              </p>
            </div>
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
              placeholder="Cari anggota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>
          
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={roleOptions}
          />
          
          <Select
            value={ukmFilter}
            onChange={(e) => setUkmFilter(e.target.value)}
            options={ukmOptions}
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-orange-600 font-semibold">Memuat data anggota...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anggota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UKM
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      {searchTerm || roleFilter || ukmFilter ? 'Tidak ada anggota yang sesuai dengan filter.' : 'Belum ada data anggota.'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.nama}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(member.role)}`}>
                          {getRoleText(member.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.ukm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewMember(member)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={deleteLoading === member.id}
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                            title="Hapus"
                          >
                            {deleteLoading === member.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredMembers.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Menampilkan {filteredMembers.length} dari {members.length} anggota
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isFormMode === 'create' ? 'Tambah Anggota Baru' :
          isFormMode === 'edit' ? 'Edit Anggota' : 'Detail Anggota'
        }
      >
        {isFormMode === 'view' ? renderMemberDetails() : renderMemberForm()}
      </Modal>
    </div>
  );
};

export default Members;
