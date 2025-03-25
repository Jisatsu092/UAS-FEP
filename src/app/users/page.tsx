'use client';
import React from 'react'; // Tambahkan ini
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

interface Booking {
  id: string;
  roomId: string;
  bookingDate: string;
  daysStayed: number;
  userId: string;
}

const generateCustomId = (name: string): string => {
  const nameParts = name.trim().split(/\s+/);
  if (nameParts.length < 2) {
    throw new Error('Nama harus terdiri dari minimal 2 kata');
  }
  const firstTwoLetters = nameParts
    .map(part => part.slice(0, 2).toUpperCase())
    .join('-');
  const alphabetPosition = nameParts
    .map(part => part.charCodeAt(0) - 64)
    .join('-');
  const totalLetters = name.replace(/\s/g, '').length;
  return `2000-${firstTwoLetters}-${alphabetPosition}-${totalLetters}`;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [emailTouched, setEmailTouched] = useState(false);
  
  // State sorting baru
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc' | 'none';
  }>({ key: 'name', direction: 'none' });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Users
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        } else {
          const response = await fetch('/user.json');
          const data = await response.json();
          const usersWithIds = data.map((user: any) => ({
            ...user,
            id: generateCustomId(user.name),
          }));
          setUsers(usersWithIds);
          localStorage.setItem('users', JSON.stringify(usersWithIds));
        }

        // Load Bookings
        const savedBookings = localStorage.getItem('bookings');
        if (savedBookings) {
          setBookings(JSON.parse(savedBookings));
        } else {
          const bookingResponse = await fetch('/booking.json');
          const bookingData = await bookingResponse.json();
          setBookings(bookingData);
          localStorage.setItem('bookings', JSON.stringify(bookingData));
        }
      } catch (error) {
        toast.error('Gagal memuat data');
      }
    };
    loadData();
  }, []);

  const handleSort = (key: keyof User) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        switch (prev.direction) {
          case 'none':
            return { key, direction: 'asc' };
          case 'asc':
            return { key, direction: 'desc' };
          default:
            return { key, direction: 'none' };
        }
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  

// Proses filtering
let filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.id.toLowerCase().includes(searchTerm.toLowerCase())
);

// Proses sorting
let sortedUsers = [...filteredUsers];
if (sortConfig.direction !== 'none') {
  sortedUsers.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const getBookingsByUserId = (userId: string): Booking[] => {
    return bookings.filter(booking => booking.userId === userId);
  };

  const handleNameChange = (name: string) => {
    const newEmail = !emailTouched
      ? `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`
      : formData.email;
    setFormData({ name, email: newEmail });
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
      setEditingUser(user);
    } else {
      setFormData({ name: '', email: '' });
      setEditingUser(null);
    }
    setEmailTouched(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.name.split(/\s+/).length < 2) {
        toast.error('Nama minimal 2 kata');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error('Email tidak valid');
        return;
      }
      if (users.some(u => u.email === formData.email && u.id !== editingUser?.id)) {
        toast.error('Email sudah terdaftar');
        return;
      }
      const updatedUsers = editingUser
        ? users.map(u => u.id === editingUser.id ? { ...formData, id: u.id } : u)
        : [...users, { ...formData, id: generateCustomId(formData.name) }];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setIsModalOpen(false);
      toast.success(editingUser ? 'Data diupdate' : 'Data ditambahkan');
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {(isModalOpen || isDeleteModalOpen) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
      )}
      <div className="max-w-6xl mx-auto relative z-30">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-lg shadow-sm z-20 mb-4">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tambah Data
            </button>
          </div>
          <div className="flex gap-4 p-4 bg-gray-50 rounded-b-lg">
            <input
              type="text"
              placeholder="🔍 Cari berdasarkan ID atau Nama..."
              className="w-full px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Tabel dengan Accordion */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-12 rounded-tl-lg">
                No
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                ID Unik
              </th>
              {/* Kolom Nama dengan Sorting */}
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Nama
                {sortConfig.key === 'name' && sortConfig.direction !== 'none' && (
                  <span className="ml-2">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-32 rounded-tr-lg">
                Aksi
              </th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((user, index) => (
                <React.Fragment key={user.id}>
                  {/* Baris Utama */}
                  <tr
                    onClick={() => setExpandedUserId(user.id === expandedUserId ? null : user.id)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      expandedUserId === user.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{user.id}</td>
                    <td className="px-4 py-3 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(user);
                        }}
                        className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserToDelete(user);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>

                  {/* Detail Booking */}
                  {expandedUserId === user.id && (
                    <tr>
                      <td colSpan={5} className="p-4 bg-gray-50">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-700">
                            Riwayat Booking untuk {user.name}
                          </h3>
                          {getBookingsByUserId(user.id).length > 0 ? (
                            <ul className="space-y-1">
                              {getBookingsByUserId(user.id).map(booking => (
                                <li key={booking.id} className="text-xs text-gray-600">
                                  <div className="flex gap-2">
                                    <span className="font-medium">Room ID:</span>
                                    <span>{booking.roomId}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="font-medium">Tanggal:</span>
                                    <span>{booking.bookingDate}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="font-medium">Durasi:</span>
                                    <span>{booking.daysStayed} hari</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-500">Tidak ada riwayat booking.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4 mb-2 md:mb-0">
            <span className="text-sm text-gray-600">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border rounded"
            >
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border hover:bg-gray-100"
              disabled={currentPage === 1}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded border hover:bg-gray-100"
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg w-full max-w-md mx-4 p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? 'Edit Data' : 'Tambah Data Baru'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Contoh: John Doe"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Contoh: john@example.com"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.email}
                    onChange={(e) => {
                      setEmailTouched(true);
                      setFormData({ ...formData, email: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Simpan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Konfirmasi Hapus</h2>
            <p className="mb-4">
              Yakin hapus pengguna <strong>{userToDelete?.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (userToDelete) {
                    const updated = users.filter(u => u.id !== userToDelete.id);
                    setUsers(updated);
                    localStorage.setItem('users', JSON.stringify(updated));
                    setIsDeleteModalOpen(false);
                    toast.success('Data terhapus');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}