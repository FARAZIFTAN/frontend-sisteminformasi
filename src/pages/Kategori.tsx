import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';

interface Kategori {
  id?: string;
  nama_kategori: string;
}

const KategoriPage: React.FC = () => {
  const { user } = useAuth();
  const { addAlert } = useAlert();
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [newKategori, setNewKategori] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/kategori', {
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      }
    })
      .then(res => res.json())
      .then(data => setKategoriList(Array.isArray(data) ? data : []));
  }, []);

  const handleAdd = () => {
    if (!newKategori.trim()) return addAlert({ message: 'Nama kategori wajib diisi', type: 'error' });
    fetch('http://localhost:3000/kategori', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      body: JSON.stringify({ nama_kategori: newKategori })
    })
      .then(res => res.json())
      .then(data => {
        setKategoriList(prev => [...prev, data]);
        setNewKategori('');
        addAlert({ message: 'Kategori berhasil ditambahkan', type: 'success' });
      });
  };

  const handleEdit = (id: string, nama: string) => {
    setEditId(id);
    setEditNama(nama);
  };

  const handleUpdate = () => {
    if (!editNama.trim() || !editId) return addAlert({ message: 'Nama kategori wajib diisi', type: 'error' });
    fetch(`http://localhost:3000/kategori/${editId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      body: JSON.stringify({ nama_kategori: editNama })
    })
      .then(res => res.json())
      .then(() => {
        setKategoriList(prev => prev.map(k => k.id === editId ? { ...k, nama_kategori: editNama } : k));
        setEditId(null);
        setEditNama('');
        addAlert({ message: 'Kategori berhasil diupdate', type: 'success' });
      });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini?')) return;
    fetch(`http://localhost:3000/kategori/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      }
    })
      .then(() => {
        setKategoriList(prev => prev.filter(k => k.id !== id));
        addAlert({ message: 'Kategori berhasil dihapus', type: 'success' });
      });
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold">Hanya admin yang dapat mengelola kategori.</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-8 space-y-8">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <span className="mr-2">🗂️</span> Manajemen Kategori UKM
          </h1>
          <p className="text-orange-100 text-lg">Tambah, edit, dan hapus kategori UKM kampus secara mudah. Hanya admin yang dapat mengelola data ini.</p>
        </div>
        <div className="flex space-x-2">
          <Input
            value={newKategori}
            onChange={e => setNewKategori(e.target.value)}
            placeholder="Nama kategori baru"
            className="w-48"
          />
          <Button onClick={handleAdd} color="orange">Tambah</Button>
        </div>
      </div>

      {/* Tabel Kategori */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 text-orange-700 text-base font-semibold">Nama Kategori</th>
              <th className="py-3 px-4 text-orange-700 text-base font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kategoriList.length === 0 ? (
              <tr><td colSpan={2} className="py-6 text-center text-gray-400">Belum ada kategori.</td></tr>
            ) : kategoriList.map(k => (
              <tr key={k.id || k.nama_kategori} className="hover:bg-orange-50 transition-all">
                <td className="py-3 px-4">
                  {editId === k.id ? (
                    <Input
                      value={editNama}
                      onChange={e => setEditNama(e.target.value)}
                      placeholder="Edit nama kategori"
                      className="w-48"
                    />
                  ) : (
                    <span className="font-medium text-gray-800 text-base">{k.nama_kategori}</span>
                  )}
                </td>
                <td className="py-3 px-4 space-x-2">
                  {editId === k.id ? (
                    <Button onClick={handleUpdate} color="green">Simpan</Button>
                  ) : (
                    <Button onClick={() => handleEdit(k.id!, k.nama_kategori)} color="blue">Edit</Button>
                  )}
                  <Button onClick={() => handleDelete(k.id!)} color="red">Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KategoriPage;
