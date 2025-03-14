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

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const mockData = {
        daily: 1500000,
        monthly: 45000000,
        yearly: 540000000,
      };
      setRevenueData(mockData);
    };
    fetchData();
  }, []);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Harian",
        data: [12000, 19000, 3000, 5000, 2000, 3000],
        borderColor: "#2563eb",
        backgroundColor: "#bfdbfe",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Bulanan",
        data: [30000, 45000, 25000, 35000, 40000, 50000],
        borderColor: "#16a34a",
        backgroundColor: "#d1fae5",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Tahunan",
        data: [150000, 200000, 180000, 220000, 250000, 300000],
        borderColor: "#ea580c",
        backgroundColor: "#fed7aa",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
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
          callback: (value) => `Rp${value.toLocaleString()}`,
        },
      },
    },
  };

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
    </motion.div>
  );
};

export default Dashboard;