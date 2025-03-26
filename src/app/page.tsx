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

type PeriodType = "daily" | "monthly" | "yearly";

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
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<{
    type: PeriodType;
    date: Date;
  }>({ 
    type: "monthly", 
    date: new Date() 
  });

  // Fungsi utilitas
  const getIndonesianMonthName = (monthIndex: number) => {
    return new Date(0, monthIndex).toLocaleDateString("id-ID", { month: "long" });
  };

  const getIndonesianDayName = (date: Date) => {
    return date.toLocaleDateString("id-ID", { weekday: "long" });
  };

  useEffect(() => {
    const loadData = () => {
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

        processData(processedData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    const processData = (data: BookingData[]) => {
      const currentDate = selectedPeriod.date;
      const currentYear = currentDate.getFullYear();

      // Filter data berdasarkan periode
      const filteredData = data.filter((b) => {
        const bookingDate = new Date(b.bookingDate);
        switch (selectedPeriod.type) {
          case "daily":
            return bookingDate.toDateString() === currentDate.toDateString();
          case "monthly":
            return (
              bookingDate.getMonth() === currentDate.getMonth() &&
              bookingDate.getFullYear() === currentYear
            );
          case "yearly":
            return bookingDate.getFullYear() === currentYear;
          default:
            return true;
        }
      });

      // Hitung pendapatan
      const daily = filteredData
        .filter((b) => 
          new Date(b.bookingDate).toDateString() === currentDate.toDateString()
        )
        .reduce((sum, b) => sum + b.totalPrice, 0);

      const monthly = filteredData
        .filter((b) => {
          const date = new Date(b.bookingDate);
          return date.getFullYear() === currentYear;
        })
        .reduce((sum, b) => sum + b.totalPrice, 0);

      const yearly = filteredData
        .filter((b) => 
          new Date(b.bookingDate).getFullYear() === currentYear
        )
        .reduce((sum, b) => sum + b.totalPrice, 0);

      // Update chart data
      const monthlyRevenue = Array(12).fill(0);
      filteredData.forEach((b) => {
        const date = new Date(b.bookingDate);
        if (date.getFullYear() === currentYear) {
          monthlyRevenue[date.getMonth()] += b.totalPrice;
        }
      });

      setChartData({
        labels: [
          `Jan ${currentYear}`, `Feb ${currentYear}`, `Mar ${currentYear}`,
          `Apr ${currentYear}`, `May ${currentYear}`, `Jun ${currentYear}`,
          `Jul ${currentYear}`, `Aug ${currentYear}`, `Sep ${currentYear}`,
          `Oct ${currentYear}`, `Nov ${currentYear}`, `Dec ${currentYear}`
        ],
        datasets: [{
          label: "Pendapatan Bulanan",
          data: monthlyRevenue,
          borderColor: "#2563eb",
          backgroundColor: "#bfdbfe",
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      });

      setRevenueData({ daily, monthly, yearly });
      setBookingsData(filteredData);
    };

    loadData();
  }, [selectedPeriod]);

  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{
      label: "",
      data: [] as number[],
      borderColor: "",
      backgroundColor: "",
      tension: 0,
      pointRadius: 0,
      pointHoverRadius: 0,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#64748b", font: { size: 14 } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#64748b" } },
      y: {
        grid: { color: "#e2e8f0" },
        ticks: { 
          color: "#64748b",
          callback: (value: any) => `Rp${value.toLocaleString()}`
        }
      }
    }
  };

  const handleSort = (key: keyof BookingData) => {
    setSortConfig(prev => ({
      key,
      direction: 
        prev.key === key ? 
          prev.direction === "asc" ? "desc" : 
          prev.direction === "desc" ? "none" : "asc" 
        : "asc"
    }));
  };

  const filteredData = bookingsData.filter(booking =>
    Object.values(booking).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.direction === "none") return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    return typeof aVal === "string" && typeof bVal === "string" ?
      sortConfig.direction === "asc" ? 
        aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      : sortConfig.direction === "asc" ?
        (aVal as number) - (bVal as number) : 
        (bVal as number) - (aVal as number);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const PeriodModal = () => {
    if (!isPeriodModalOpen) return null;

    const handleDateChange = (newDate: Date) => {
      setSelectedPeriod(prev => ({ ...prev, date: newDate }));
    };

    const renderOptions = () => {
      switch (selectedPeriod.type) {
        case "daily":
          const startDate = new Date(selectedPeriod.date);
          // Mulai dari Senin
          startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
          
          return [...Array(7)].map((_, i) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            return (
              <button
                key={i}
                onClick={() => handleDateChange(date)}
                className={`p-2 text-left rounded ${
                  date.toDateString() === selectedPeriod.date.toDateString()
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {getIndonesianDayName(date)}
                <span className="block text-sm text-gray-500">
                  {date.toLocaleDateString("id-ID")}
                </span>
              </button>
            );
          });

        case "monthly":
          return [...Array(12)].map((_, i) => (
            <option key={i} value={i}>
              {getIndonesianMonthName(i)}
            </option>
          ));

        case "yearly":
          return [2024, 2025, 2026, 2027, 2028].map(year => (
            <option key={year} value={year}>{year}</option>
          ));
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-xl font-bold mb-4">
            {{
              daily: "Pilih Hari",
              monthly: "Pilih Bulan",
              yearly: "Pilih Tahun"
            }[selectedPeriod.type]}
          </h3>

          {selectedPeriod.type === "daily" ? (
            <div className="grid grid-cols-1 gap-2">
              {renderOptions()}
            </div>
          ) : (
            <select
              className="w-full p-2 border rounded"
              value={
                selectedPeriod.type === "monthly" ?
                selectedPeriod.date.getMonth() :
                selectedPeriod.date.getFullYear()
              }
              onChange={(e) => {
                const newDate = new Date(selectedPeriod.date);
                selectedPeriod.type === "monthly" ?
                  newDate.setMonth(parseInt(e.target.value)) :
                  newDate.setFullYear(parseInt(e.target.value));
                handleDateChange(newDate);
              }}
            >
              {renderOptions()}
            </select>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsPeriodModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              onClick={() => setIsPeriodModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RevenueCard = ({ type, label, value }: { 
    type: PeriodType;
    label: string;
    value: number 
  }) => {
    const getPeriodLabel = () => {
      if (selectedPeriod.type !== type) return null;
      switch(type) {
        case "daily":
          return selectedPeriod.date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          });
        case "monthly":
          return `${getIndonesianMonthName(selectedPeriod.date.getMonth())} ${selectedPeriod.date.getFullYear()}`;
        case "yearly":
          return selectedPeriod.date.getFullYear().toString();
      }
    };

    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`card-3d bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden cursor-pointer ${
          selectedPeriod.type === type ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => {
          setSelectedPeriod(prev => ({ ...prev, type }));
          setIsPeriodModalOpen(true);
        }}
      >
        <div className="card-3d-inner">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {label}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 text-right">
              {selectedPeriod.type === type && (
                <div className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  {getPeriodLabel()}
                </div>
              )}
            </span>
          </div>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-gray-900 dark:text-white mr-2">
              Rp{value.toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <style>{`
        .card-3d { perspective: 1000px; }
        .card-3d-inner { transform-style: preserve-3d; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-3d:hover .card-3d-inner { transform: translateY(-10px) rotateX(5deg); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .card-3d::after { content: ''; position: absolute; bottom: -20px; left: 0; right: 0; height: 40px; 
          background: linear-gradient(transparent 30%, rgba(0,0,0,0.05)); transform: scaleY(0.5); 
          transition: transform 0.3s ease; z-index: -1; }
        .card-3d:hover::after { transform: scaleY(1); }
      `}</style>

      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <RevenueCard type="daily" label="Pendapatan Harian" value={revenueData.daily} />
        <RevenueCard type="monthly" label="Pendapatan Bulanan" value={revenueData.monthly} />
        <RevenueCard type="yearly" label="Pendapatan Tahunan" value={revenueData.yearly} />
      </div>

      <PeriodModal />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Statistik Pendapatan {selectedPeriod.date.getFullYear()}
          </h3>
          {selectedPeriod.type === "monthly" && (
            <span className="text-sm text-gray-500">
              {getIndonesianMonthName(selectedPeriod.date.getMonth())}
            </span>
          )}
        </div>
        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>

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
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>Tampilkan {size}</option>
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
                ].map(header => (
                  <th
                    key={header.key}
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => handleSort(header.key as keyof BookingData)}
                  >
                    {header.label}
                    {sortConfig.key === header.key && sortConfig.direction !== "none" && (
                      <span className="ml-2">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">{booking.userName}</td>
                  <td className="px-4 py-3">{booking.roomName}</td>
                  <td className="px-4 py-3">
                    {new Date(booking.bookingDate).toLocaleDateString("id-ID")}
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

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Menampilkan {indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, sortedData.length)} dari{" "}
            {sortedData.length} entri
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "border hover:bg-gray-100"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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