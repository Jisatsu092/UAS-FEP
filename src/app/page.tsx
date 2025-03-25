"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BookingData {
  id: string;
  roomId: string;
  bookingDate: string;
  daysStayed: number;
  userId: string;
  roomName: string;
  userName: string;
  totalPrice: number;
}

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
  });
  
  const [bookingsData, setBookingsData] = useState<BookingData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof BookingData;
    direction: "asc" | "desc" | "none";
  }>({ key: "bookingDate", direction: "none" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = () => {
      try {
        const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
        const rooms = JSON.parse(localStorage.getItem("rooms") || "[]");
        const users = JSON.parse(localStorage.getItem("users") || "[]");

        const processedData = bookings.map((booking: any) => {
          const room = rooms.find((r: any) => r.id === booking.roomId);
          const user = users.find((u: any) => u.id === booking.userId);
          return {
            ...booking,
            roomName: room?.name || "Unknown",
            userName: user?.name || "Unknown",
            totalPrice: room ? room.price * booking.daysStayed : 0,
          };
        });

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Calculate revenues
        const daily = processedData
          .filter(
            (b: BookingData) =>
              new Date(b.bookingDate).toDateString() === today.toDateString()
          )
          .reduce((sum: number, b: BookingData) => sum + b.totalPrice, 0);

        const monthly = processedData
          .filter((b: BookingData) => {
            const date = new Date(b.bookingDate);
            return (
              date.getMonth() === currentMonth &&
              date.getFullYear() === currentYear
            );
          })
          .reduce((sum: number, b: BookingData) => sum + b.totalPrice, 0);

        const yearly = processedData
          .filter(
            (b: BookingData) =>
              new Date(b.bookingDate).getFullYear() === currentYear
          )
          .reduce((sum: number, b: BookingData) => sum + b.totalPrice, 0);

        // Calculate monthly data for chart
        const monthlyRevenue = Array(12).fill(0);
        processedData.forEach((b: BookingData) => {
          const date = new Date(b.bookingDate);
          if (date.getFullYear() === currentYear) {
            monthlyRevenue[date.getMonth()] += b.totalPrice;
          }
        });

        setRevenueData({ daily, monthly, yearly });
        setBookingsData(processedData);
        setChartData({
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Pendapatan Bulanan",
              data: monthlyRevenue,
              borderColor: "#2563eb",
              backgroundColor: "#bfdbfe",
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "",
        data: [] as number[],
        borderColor: "",
        backgroundColor: "",
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#64748b",
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
        },
      },
      y: {
        grid: {
          color: "#e2e8f0",
        },
        ticks: {
          color: "#64748b",
          callback: (value: any) => `Rp${value.toLocaleString()}`,
        },
      },
    },
  };

  const handleSort = (key: keyof BookingData) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key
          ? prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
            ? "none"
            : "asc"
          : "asc",
    }));
  };

  const filteredData = bookingsData.filter((booking) =>
    Object.values(booking).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.direction === "none") return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortConfig.direction === "asc"
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <style>
        {`
          .card-3d {
            perspective: 1000px;
          }
          
          .card-3d-inner {
            transform-style: preserve-3d;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .card-3d:hover .card-3d-inner {
            transform: translateY(-10px) rotateX(5deg);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          
          .card-3d::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 40px;
            background: linear-gradient(
              transparent 30%,
              rgba(0,0,0,0.05)
            );
            transform: scaleY(0.5);
            transition: transform 0.3s ease;
            z-index: -1;
          }
          
          .card-3d:hover::after {
            transform: scaleY(1);
          }
        `}
      </style>

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card Pendapatan Harian */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-3d bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
        >
          <div className="card-3d-inner">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Pendapatan Harian
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Harian
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
                Rp{revenueData.daily.toLocaleString()}
              </span>
              <span className="text-sm text-green-500">+12.5%</span>
            </div>
          </div>
        </motion.div>

        {/* Card Pendapatan Bulanan */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card-3d bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
        >
          <div className="card-3d-inner">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Pendapatan Bulanan
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Bulanan
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
                Rp{revenueData.monthly.toLocaleString()}
              </span>
              <span className="text-sm text-green-500">+8.3%</span>
            </div>
          </div>
        </motion.div>

        {/* Card Pendapatan Tahunan */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card-3d bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
        >
          <div className="card-3d-inner">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Pendapatan Tahunan
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tahunan
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
                Rp{revenueData.yearly.toLocaleString()}
              </span>
              <span className="text-sm text-green-500">+5.7%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Statistik Chart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <h3 className="text-xl font-medium mb-6 text-gray-700 dark:text-gray-300">
          Statistik Pendapatan
        </h3>
        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>
     {/* Tabel Booking */}
     <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mt-6"
      >
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Daftar Booking Terkini
          </h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Cari booking..."
              className="px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="px-4 py-2 border rounded-lg"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  Tampilkan {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {[
                  { key: "userName", label: "Nama Pemesan" },
                  { key: "roomName", label: "Ruangan" },
                  { key: "bookingDate", label: "Tanggal Booking" },
                  { key: "daysStayed", label: "Lama Menginap" },
                  { key: "totalPrice", label: "Total Harga" },
                ].map((header) => (
                  <th
                    key={header.key}
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort(header.key as keyof BookingData)}
                  >
                    {header.label}
                    {sortConfig.key === header.key &&
                      sortConfig.direction !== "none" && (
                        <span className="ml-2">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">{booking.userName}</td>
                  <td className="px-4 py-3">{booking.roomName}</td>
                  <td className="px-4 py-3">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{booking.daysStayed} Hari</td>
                  <td className="px-4 py-3">
                    Rp{booking.totalPrice.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Menampilkan {indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, sortedData.length)} dari{" "}
            {sortedData.length} entri
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-100"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;