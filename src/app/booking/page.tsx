"use client";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

interface Room {
  id: string;
  name: string;
  capacity: number;
  category: string;
  price: number;
  status: "Available" | "Occupied" | "Draft";
}

interface User {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  roomId: string;
  bookingDate: string;
  daysStayed: number;
  userId: string;
}

export default function BookingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    roomId: "",
    bookingDate: new Date().toISOString().split("T")[0],
    daysStayed: "",
    userId: "",
  });

  // State sorting baru
  const [sortConfig, setSortConfig] = useState({
    key: "roomId",
    direction: "none" as "asc" | "desc" | "none",
  });

  // Proses filtering
  const filteredBookings = bookings.filter((booking) => {
    const room = rooms.find((r) => r.id === booking.roomId);
    const user = users.find((u) => u.id === booking.userId);
    return (
      room?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Proses sorting
  let sortedBookings = [...filteredBookings];
  if (sortConfig.direction !== "none") {
    sortedBookings.sort((a, b) => {
      const roomA = rooms.find((r) => r.id === a.roomId)?.name || "";
      const roomB = rooms.find((r) => r.id === b.roomId)?.name || "";

      return sortConfig.direction === "asc"
        ? roomA.localeCompare(roomB)
        : roomB.localeCompare(roomA);
    });
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load rooms
        const savedRooms = localStorage.getItem("rooms");
        if (savedRooms) {
          setRooms(JSON.parse(savedRooms));
        } else {
          const defaultRooms: Room[] = [
            {
              id: "1",
              name: "Room A",
              capacity: 2,
              category: "Deluxe",
              price: 500000,
              status: "Available",
            },
            {
              id: "2",
              name: "Room B",
              capacity: 4,
              category: "Suite",
              price: 750000,
              status: "Draft",
            },
            {
              id: "3",
              name: "Room C",
              capacity: 6,
              category: "VIP",
              price: 1000000,
              status: "Occupied",
            },
          ];
          setRooms(defaultRooms);
          localStorage.setItem("rooms", JSON.stringify(defaultRooms));
        }

        // Load users
        const savedUsers = localStorage.getItem("users");
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        } else {
          const defaultUsers: User[] = [
            { id: "1", name: "John Doe" },
            { id: "2", name: "Jane Smith" },
            { id: "3", name: "Alice Johnson" },
          ];
          setUsers(defaultUsers);
          localStorage.setItem("users", JSON.stringify(defaultUsers));
        }

        // Load bookings
        const savedBookings = localStorage.getItem("bookings");
        if (savedBookings) {
          setBookings(JSON.parse(savedBookings));
        }
      } catch (error) {
        toast.error("Gagal memuat data");
      }
    };

    loadData();
  }, []);

  // Fungsi cek ketersediaan kamar
  const isRoomAvailable = (roomId: string, bookingDate: string): boolean => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room || room.status !== "Available") return false;

    const bookingStart = new Date(bookingDate);
    const bookingEnd = new Date(bookingStart);
    bookingEnd.setDate(bookingEnd.getDate() + parseInt(formData.daysStayed));

    return !bookings.some((booking) => {
      if (booking.roomId !== roomId) return false;

      const existingStart = new Date(booking.bookingDate);
      const existingEnd = new Date(existingStart);
      existingEnd.setDate(existingEnd.getDate() + booking.daysStayed);

      return bookingStart < existingEnd && existingStart < bookingEnd;
    });
  };

  // Handle submit booking
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.roomId ||
      !formData.bookingDate ||
      !formData.userId ||
      !formData.daysStayed ||
      parseInt(formData.daysStayed) < 1
    ) {
      toast.error("Harap isi semua field dengan benar");
      return;
    }

    const daysStayed = parseInt(formData.daysStayed);
    const newBooking: Booking = {
      id: editingBooking?.id || Date.now().toString(),
      roomId: formData.roomId,
      bookingDate: formData.bookingDate,
      daysStayed,
      userId: formData.userId,
    };

    const updatedBookings = editingBooking
      ? bookings.map((b) => (b.id === editingBooking.id ? newBooking : b))
      : [...bookings, newBooking];

    // Update status kamar
    const updateRoomStatus = (roomId: string, status: Room["status"]) => {
      const updatedRooms = rooms.map((room) =>
        room.id === roomId ? { ...room, status } : room
      );
      setRooms(updatedRooms);
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    };

    if (editingBooking) {
      // Handle perubahan kamar saat edit
      if (editingBooking.roomId !== formData.roomId) {
        const hasOtherBookings = bookings.some(
          (b) =>
            b.roomId === editingBooking.roomId && b.id !== editingBooking.id
        );

        if (!hasOtherBookings) {
          updateRoomStatus(editingBooking.roomId, "Available");
        }
      }
    }

    // Update status kamar baru ke Occupied
    updateRoomStatus(formData.roomId, "Occupied");

    // Simpan perubahan
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));

    // Reset form
    setIsModalOpen(false);
    setFormData({
      roomId: "",
      bookingDate: new Date().toISOString().split("T")[0],
      daysStayed: "",
      userId: "",
    });
    toast.success(editingBooking ? "Booking diperbarui" : "Booking dibuat");
  };

  // Handle hapus booking
  const handleDelete = (id: string) => {
    const bookingToDelete = bookings.find((b) => b.id === id);
    if (!bookingToDelete) return;

    const updatedBookings = bookings.filter((b) => b.id !== id);

    // Update status kamar jika perlu
    const hasOtherBookings = updatedBookings.some(
      (b) => b.roomId === bookingToDelete.roomId
    );

    if (!hasOtherBookings) {
      const updatedRooms = rooms.map((room) =>
        room.id === bookingToDelete.roomId
          ? { ...room, status: "Available" }
          : room
      );
      setRooms(updatedRooms);
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    }

    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    toast.success("Booking dihapus");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "daysStayed") {
      const numericValue = parseInt(value);
      setFormData({
        ...formData,
        [name]: isNaN(numericValue) ? "" : numericValue,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);

  // Fungsi handle sorting
  const handleSort = (key: "roomId") => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }
      return {
        key,
        direction:
          prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
            ? "none"
            : "asc",
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Backdrop Blur */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsModalOpen(false)}
        />
      )}
      <div className="max-w-6xl mx-auto relative z-30">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-lg shadow-sm z-20 mb-4">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Manajemen Booking Ruangan
            </h1>
            <button
              onClick={() => {
                setEditingBooking(null);
                setFormData({
                  roomId: "",
                  bookingDate: new Date().toISOString().split("T")[0],
                  daysStayed: "",
                  userId: "",
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tambah Booking
            </button>
          </div>
          <div className="flex gap-4 p-4 bg-gray-50 rounded-b-lg">
            <input
              type="text"
              placeholder="🔍 Cari berdasarkan Ruangan atau Nama..."
              className="w-full px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        {/* Tabel */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-12 rounded-tl-lg">
                  No
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("roomId")}
                >
                  Ruangan
                  {sortConfig.key === "roomId" &&
                    sortConfig.direction !== "none" && (
                      <span className="ml-2">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Tanggal Booking
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Lama Menginap
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Dipesan Oleh
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Total Harga
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-32 rounded-tr-lg">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((booking, index) => {
                const room = rooms.find((r) => r.id === booking.roomId);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm">{room?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm">{room?.status || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {booking.daysStayed} Hari
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {users.find((u) => u.id === booking.userId)?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      Rp
                      {room
                        ? (room.price * booking.daysStayed).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => {
                          setEditingBooking(booking);
                          setFormData({
                            roomId: booking.roomId,
                            bookingDate: booking.bookingDate,
                            daysStayed: booking.daysStayed.toString(),
                            userId: booking.userId,
                          });
                          setIsModalOpen(true);
                        }}
                        className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
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
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredBookings.length)} dari{" "}
              {filteredBookings.length}
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
      {/* Modal Tambah/Edit Booking */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg w-full max-w-md mx-4 p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingBooking ? "Edit Booking" : "Tambah Booking Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Pilih Ruangan */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ruangan
                  </label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Pilih Ruangan</option>
                    {rooms
                      .filter(
                        (room) =>
                          room.status !== "Draft" &&
                          isRoomAvailable(room.id, formData.bookingDate)
                      )
                      .map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} - {room.category} (Kapasitas:{" "}
                          {room.capacity}, Rp{room.price.toLocaleString()}/hari)
                        </option>
                      ))}
                  </select>
                </div>
                {/* Tanggal Booking */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tanggal Booking
                  </label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                {/* Lama Menginap */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Lama Menginap (Hari)
                  </label>
                  <input
                    type="number"
                    name="daysStayed"
                    value={formData.daysStayed}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Masukkan jumlah hari"
                    className="w-full px-4 py-2 border rounded-lg 
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
              [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    required
                  />
                </div>
                {/* Pilih User */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dipesan Oleh
                  </label>
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Pilih User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Total Harga */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Harga
                  </label>
                  <input
                    type="text"
                    value={`Rp${
                      formData.roomId && formData.daysStayed
                        ? (rooms.find((r) => r.id === formData.roomId)?.price ||
                            0) * parseInt(formData.daysStayed)
                        : 0
                    }`.toLocaleString()}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
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
                  {editingBooking ? "Simpan" : "Tambahkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

// Fungsi Hapus
