import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import {
  Package,
  ChevronRight,
  Calendar,
  MapPin,
  BarChart3,
  List,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Truck,
  UserCheck
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const STATUS_OPTIONS = [
  "Order Placed",
  "Processing",
  "Packing",
  "Out for delivery",
  "Delivered",
];

const SellerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const socketRef = useRef(null);

  // =============== Stats =================
  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === "Delivered");
    const totalEarnings = deliveredOrders.reduce(
      (acc, o) => acc + (Number(o.totalAmount || o.orderDetails?.totalAmount) || 0),
      0
    );
    return {
      totalEarnings,
      deliveredCount: deliveredOrders.length,
      activeRiders: new Set(orders.map(o => o.assignedDeliveryBoy?._id).filter(Boolean)).size,
      totalOrders: orders.length
    };
  }, [orders]);

  // =============== Chart Data =================
  const getStatusChartData = () => {
    const counts = STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    orders.forEach(order => {
      const status = order.status || "Order Placed";
      if (counts[status] !== undefined) counts[status]++;
      else counts["Order Placed"]++;
    });

    return STATUS_OPTIONS.map(status => ({
      name: status,
      count: counts[status],
    }));
  };

  const statusColors = {
    "Order Placed": "#facc15",
    "Processing": "#3b82f6",
    "Packing": "#6366f1",
    "Out for delivery": "#f97316",
    "Delivered": "#10b981",
  };

  // =============== Fetch Data (No Auth) =================
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsSyncing(true);

    try {
      const [ordersRes, leadersRes] = await Promise.all([
        axios.get("https://kgsuper-server-production.up.railway.app/api/seller/orders"),
        axios.get("https://kgsuper-server-production.up.railway.app/api/seller/top-delivery-boys"),
      ]);

      setOrders(ordersRes?.data?.data || []);
      setLeaders(
        (leadersRes?.data || []).map(boy => ({
          ...boy,
          totalDelivered: Number(boy.totalDelivered) || 0
        }))
      );
    } catch (err) {
      console.error(err?.response || err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // =============== Real-time Updates =================
  useEffect(() => {
    fetchData();
    socketRef.current = io("http://localhost:4000", { transports: ["websocket"] });
    socketRef.current.on("orderUpdated", () => fetchData(true));
    socketRef.current.on("leaderboardUpdated", () => fetchData(true));
    return () => socketRef.current?.disconnect();
  }, []);

  // =============== Status Colors =================
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-700 border-green-200";
      case "Order Placed": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Packing": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Out for delivery": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // =============== Loading =================
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-center">
        <RefreshCw size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
        <p className="font-bold text-slate-600 uppercase tracking-widest">Loading Seller Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">SELLER DASHBOARD</h1>
            <p className="text-slate-500 text-sm font-medium">Monitoring Rider Performance & Revenue</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 font-bold text-sm hover:shadow-md transition"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            Sync Real-time Data
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<DollarSign className="text-emerald-600"/>} label="Total Revenue" value={`LKR ${stats.totalEarnings.toLocaleString()}`} color="bg-emerald-50" />
          <StatCard icon={<Truck className="text-blue-600"/>} label="Delivered" value={stats.deliveredCount} color="bg-blue-50" />
          <StatCard icon={<UserCheck className="text-purple-600"/>} label="Active Riders" value={stats.activeRiders} color="bg-purple-50" />
          <StatCard icon={<Package className="text-orange-600"/>} label="Total Orders" value={stats.totalOrders} color="bg-orange-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Charts + Leaderboard */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Fulfillment Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-black mb-6 flex items-center gap-2 text-slate-800 uppercase text-xs tracking-widest">
                <CheckCircle2 size={18} className="text-green-500" /> Order Fulfillment
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getStatusChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '15px', border: 'none' }} />
                    <Bar dataKey="count" radius={[10,10,0,0]} barSize={35}>
                      {getStatusChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.name]} />
                      ))}
                    </Bar>                                
                  </BarChart>                                               
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rider Leaderboard */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-black mb-4 flex items-center gap-2 text-slate-800 uppercase text-xs tracking-widest">
                <BarChart3 size={18} className="text-blue-500" /> Rider Leaderboard
              </h3>
              {leaders.length > 0 ? (
                <div className="space-y-4">
                  {leaders.slice(0, 5).map((rider, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-sm text-slate-700">{rider.name}</span>
                      <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-black">{rider.totalDelivered} DELIVERED</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400 py-10">Waiting for rider data...</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Orders List */}
          <div className="lg:col-span-8">
            <h3 className="font-black text-xl mb-6 flex items-center gap-2 uppercase tracking-tight">
              <List size={22} className="text-blue-600"/> Recent Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map(order => (
                <div key={order._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg">
                      #{order._id.slice(-6)}
                    </span>
                    <span className={`text-[10px] px-3 py-1 rounded-full border font-black uppercase ${getStatusColor(order.status)}`}>
                      {order.status || "Order Placed"}
                    </span>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 shrink-0">
                      <QRCodeCanvas value={`http://localhost:5173/delivery/${order._id}`} size={60} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <MapPin size={14} className="text-blue-500" />
                        {order.orderDetails?.address?.city || "Remote Location"}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                        <DollarSign size={14} /> LKR {(order.totalAmount || order.orderDetails?.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-[10px]">
                        {order.assignedDeliveryBoy?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Rider</p>
                        <p className="text-xs font-black text-slate-800">{order.assignedDeliveryBoy?.name || "Searching..."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============== Stat Card Component =================
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`${color} p-4 rounded-2xl`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

export default SellerDashboard;
