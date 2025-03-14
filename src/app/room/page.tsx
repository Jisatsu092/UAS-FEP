"use client";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

// 1. Tambahkan "Draft" ke tipe status
interface Room {
  id: string;
  name: string;
  capacity: number;
  category: string;
  price: number;
  status: "Available" | "Occupied" | "Draft";
}

const generateUniqueId = (): string => {
  return `ROOM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 0,
    category: "",
    price: 0,
  });
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedRooms = localStorage.getItem("rooms");
        if (savedRooms) {
          setRooms(JSON.parse(savedRooms));
          return;
        }
        const sampleData = [
          {
            id: generateUniqueId(),
            name: "Deluxe Room",
            capacity: 2,
            category: "Luxury",
            price: 2000000,
            status: "Available",
          },
          {
            id: generateUniqueId(),
            name: "Standard Room",
            capacity: 4,
            category: "Economy",
            price: 1000000,
            status: "Occupied",
          },
        ];
        setRooms(sampleData);
        localStorage.setItem("rooms", JSON.stringify(sampleData));
      } catch (error) {
        toast.error("Gagal memuat data");
      }
    };
    loadData();
  }, []);

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setFormData({
        name: room.name,
        capacity: room.capacity,
        category: room.category,
        price: room.price,
      });
      setEditingRoom(room);
    } else {
      setFormData({ name: "", capacity: 0, category: "", price: 0 });
      setEditingRoom(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        toast.error("Nama tidak boleh kosong");
        return;
      }
      const updatedRooms = editingRoom
        ? rooms.map((room) =>
            room.id === editingRoom.id ? { ...room, ...formData } : room
          )
        : [
            ...rooms,
            {
              ...formData,
              id: generateUniqueId(),
              status: "Draft", // 2. Ubah status awal menjadi Draft
            },
          ];
      setRooms(updatedRooms);
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
      setIsModalOpen(false);
      toast.success(editingRoom ? "Data diupdate" : "Data ditambahkan");
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleStatusChange = (
    id: string,
    status: "Available" | "Occupied" | "Maintenance" | "Draft"
  ) => {
    const updatedRooms = rooms.map((room) =>
      room.id === id ? { ...room, status } : room
    );
    setRooms(updatedRooms);
    localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    toast.success(`Status diubah menjadi ${status}`);
  };

  const handleDelete = () => {
    if (roomToDelete) {
      const updatedRooms = rooms.filter((room) => room.id !== roomToDelete.id);
      setRooms(updatedRooms);
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
      setIsDeleteModalOpen(false);
      toast.success("Data terhapus");
    }
  };

  const formatCurrency = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {(isModalOpen || isDeleteModalOpen) && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => {
            setIsModalOpen(false);
            setIsDeleteModalOpen(false);
          }}
        />
      )}
      <div className="max-w-6xl mx-auto relative z-30">
        <div className="sticky top-0 bg-white rounded-lg shadow-sm z-20 mb-4">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Room Management
            </h1>
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
              placeholder="🔍 Cari berdasarkan Nama atau Kategori..."
              className="w-full px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-12 rounded-tl-lg">
                  No
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Capacity
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-32 rounded-tr-lg">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((room, index) => (
                <tr
                  key={room.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm">{room.name}</td>
                  <td className="px-4 py-3 text-sm">{room.capacity}</td>
                  <td className="px-4 py-3 text-sm">{room.category}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(room.price)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        room.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : room.status === "Occupied"
                          ? "bg-red-100 text-red-800"
                          : room.status === "Maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-300 text-gray-800" // 3. Styling untuk Draft
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-y-2 flex flex-col">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(room.id, "Available");
                        }}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 w-full"
                      >
                        Available
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(room.id, "Occupied");
                        }}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 w-full"
                      >
                        Occupied
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(room);
                        }}
                        className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoomToDelete(room);
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 w-full"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredRooms.length)} dari{" "}
              {filteredRooms.length}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
              {editingRoom ? "Edit Data" : "Tambah Data Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="Contoh: Deluxe Room"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="Masukkan kapasitas (Contoh: 2)"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.capacity || ""} // Tampilkan kosong jika 0
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Economy">Economy</option>
                    <option value="Family">Family</option>
                    <option value="Executive">Executive</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="Masukkan harga (Contoh: 2000000)"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.price || ""} // Tampilkan kosong jika 0
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
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
                  {editingRoom ? "Simpan" : "Tambahkan"}
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
              Yakin hapus ruangan <strong>{roomToDelete?.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
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
