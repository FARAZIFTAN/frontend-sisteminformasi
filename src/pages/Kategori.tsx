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
    fetch('http://backend-sisteminformasi-production.up.railway.app/kategori', {
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      }
    })
      .then(res => res.json())
      .then(data => setKategoriList(Array.isArray(data) ? data : []));
  }, []);

  const handleAdd = () => {
    if (!newKategori.trim()) return addAlert({ message: 'Nama kategori wajib diisi', type: 'error' });
    fetch('http://backend-sisteminformasi-production.up.railway.app/kategori', {
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
    fetch(`http://backend-sisteminformasi-production.up.railway.app/kategori/${editId}`, {
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
    fetch(`http://backend-sisteminformasi-production.up.railway.app/kategori/${id}`, {
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
    <div className="w-full max-w-none space-y-8 p-6 mt-0">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 mb-6 relative overflow-hidden">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2 flex items-center drop-shadow">
            <span className="mr-3 text-4xl">🗂️</span> Manajemen Kategori UKM
          </h1>
          <p className="text-orange-100 text-lg">Tambah, edit, dan hapus kategori UKM kampus secara mudah. <span className="font-semibold">Hanya admin</span> yang dapat mengelola data ini.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 items-center bg-white bg-opacity-10 rounded-xl p-4 shadow-inner">
          <Input
            value={newKategori}
            onChange={e => setNewKategori(e.target.value)}
            placeholder="Nama kategori baru"
            className="w-52 bg-white bg-opacity-80 text-gray-900 placeholder-gray-400 border-0 focus:ring-2 focus:ring-orange-300"
          />
          <Button onClick={handleAdd} color="orange" className="w-full md:w-auto font-semibold shadow-md">Tambah</Button>
        </div>
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white opacity-10 rounded-full -mb-10 -mr-10"></div>
      </div>

      {/* Tabel Kategori */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
            <tr>
              <th className="py-4 px-6 text-orange-700 text-base font-bold tracking-wide">Nama Kategori</th>
              <th className="py-4 px-6 text-orange-700 text-base font-bold tracking-wide text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kategoriList.length === 0 ? (
              <tr><td colSpan={2} className="py-8 text-center text-gray-400 text-lg">Belum ada kategori.</td></tr>
            ) : kategoriList.map(k => (
              <tr key={k.id || k.nama_kategori} className="hover:bg-orange-50 transition-all group">
                <td className="py-4 px-6 align-middle">
                  {editId === k.id ? (
                    <Input
                      value={editNama}
                      onChange={e => setEditNama(e.target.value)}
                      placeholder="Edit nama kategori"
                      className="w-52 border-orange-300 focus:ring-2 focus:ring-orange-400"
                    />
                  ) : (
                    <span className="font-semibold text-gray-800 text-base group-hover:text-orange-600 transition-colors">{k.nama_kategori}</span>
                  )}
                </td>
                <td className="py-4 px-6 align-middle text-center space-x-2">
                  {editId === k.id ? (
                    <Button onClick={handleUpdate} color="green" className="font-semibold px-4">Simpan</Button>
                  ) : (
                    <Button onClick={() => handleEdit(k.id!, k.nama_kategori)} color="blue" className="font-semibold px-4">Edit</Button>
                  )}
                  <Button onClick={() => handleDelete(k.id!)} color="red" className="font-semibold px-4">Hapus</Button>
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
