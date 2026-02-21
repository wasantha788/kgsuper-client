import React, { useEffect, useState, useRef, useMemo } from "react";
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

  const getStatusChartData = () => {
    const counts = STATUS_OPTIONS.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
    orders.forEach(order => {
      const status = order.status || "Order Placed";
      counts[status] = (counts[status] || 0) + 1;
    });
    return STATUS_OPTIONS.map(status => ({ name: status, count: counts[status] }));
  };

  const statusColors = {
    "Order Placed": "#facc15",
    "Processing": "#3b82f6",
    "Packing": "#6366f1",
    "Out for delivery": "#f97316",
    "Delivered": "#10b981",
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsSyncing(true);
    try {
      const [ordersRes, leadersRes] = await Promise.all([
        axios.get("https://kgsuper-server-production.up.railway.app/api/seller/orders"),
        axios.get("https://kgsuper-server-production.up.railway.app/api/seller/top-delivery-boys"),
      ]);
      setOrders(ordersRes?.data?.data || []);
      setLeaders((leadersRes?.data || []).map(boy => ({
        ...boy,
        totalDelivered: Number(boy.totalDelivered) || 0
      })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
    socketRef.current = io("https://kgsuper-server-production.up.railway.app", { transports: ["websocket"] });
    socketRef.current.on("orderUpdated", () => fetchData(true));
    socketRef.current.on("leaderboardUpdated", () => fetchData(true));
    return () => socketRef.current?.disconnect();
  }, []);

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

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-center">
        <RefreshCw size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
        <p className="font-bold text-slate-600 uppercase tracking-widest">Loading Seller Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">SELLER DASHBOARD</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Monitoring Rider Performance & Revenue</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-2 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-sm border border-slate-200 font-bold text-xs sm:text-sm hover:shadow-md transition"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            Sync Real-time Data
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard icon={<DollarSign className="text-emerald-600"/>} label="Total Revenue" value={`LKR ${stats.totalEarnings.toLocaleString()}`} color="bg-emerald-50" />
          <StatCard icon={<Truck className="text-blue-600"/>} label="Delivered" value={stats.deliveredCount} color="bg-blue-50" />
          <StatCard icon={<UserCheck className="text-purple-600"/>} label="Active Riders" value={stats.activeRiders} color="bg-purple-50" />
          <StatCard icon={<Package className="text-orange-600"/>} label="Total Orders" value={stats.totalOrders} color="bg-orange-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Fulfillment Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-black mb-4 flex items-center gap-2 text-slate-800 uppercase text-xs tracking-widest">
                <CheckCircle2 size={16} className="text-green-500" /> Order Fulfillment
              </h3>
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getStatusChartData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="count" radius={[8,8,0,0]} barSize={25}>
                      {getStatusChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.name]} />
                      ))}
                    </Bar>                                
                  </BarChart>                                               
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rider Leaderboard */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-black mb-3 flex items-center gap-2 text-slate-800 uppercase text-xs tracking-widest">
                <BarChart3 size={16} className="text-blue-500" /> Rider Leaderboard
              </h3>
              {leaders.length > 0 ? (
                <div className="space-y-2">
                  {leaders.slice(0, 5).map((rider, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                      <span className="font-bold text-sm text-slate-700 truncate">{rider.name}</span>
                      <span className="bg-blue-600 text-white text-[9px] px-2 py-1 rounded-full font-black">{rider.totalDelivered} DELIVERED</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400 py-6">Waiting for rider data...</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Orders */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-black text-lg sm:text-xl flex items-center gap-2 uppercase tracking-tight">
              <List size={18} className="text-blue-600"/> Recent Activity
            </h3>
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order._id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition overflow-hidden">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg">
                      #{order._id.slice(-6)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black uppercase ${getStatusColor(order.status)}`}>
                      {order.status || "Order Placed"}
                    </span>
                  </div>
                  <div className="flex gap-3 mb-3 items-center">
                    <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
                      <QRCodeCanvas value={`https://kgsuper-client-production.up.railway.app/delivery/${order._id}`} size={50} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <MapPin size={12} className="text-blue-500" />
                        {order.orderDetails?.address?.city || "Remote Location"}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <DollarSign size={12} /> LKR {(order.totalAmount || order.orderDetails?.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-[10px]">
                      {order.assignedDeliveryBoy?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Rider</p>
                      <p className="text-xs font-black text-slate-800">{order.assignedDeliveryBoy?.name || "Searching..."}</p>
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

// STAT CARD
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
    <div className={`${color} p-3 rounded-xl`}>{icon}</div>
    <div className="flex-1">
      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm sm:text-base font-black text-slate-900 truncate">{value}</p>
    </div>
  </div>
);

export default SellerDashboard;