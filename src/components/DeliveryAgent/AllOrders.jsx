import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";
import {
  MapPin,
  BarChart3,
  RefreshCw,
  Package,
  CheckCircle,
  Clock,
  TrendingUp,
  Phone,
  Calendar,
  ShoppingBag,
  History
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
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const AllOrders = () => {
  const { axios, user, setUser, setIsdelivery, currency } = useAppContext();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const logoutRider = useCallback(() => {
    localStorage.removeItem("deliveryToken");
    setUser(null);
    setIsdelivery(false);
    navigate("/delivery-login");
  }, [navigate, setUser, setIsdelivery]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("deliveryToken");
      if (!token) return logoutRider();

      const [ordersRes, historyRes] = await Promise.all([
        axios.get("/api/delivery/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/delivery/order-history", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const activeOrders = (ordersRes.data?.orders || []).filter(
        (o) => !["Delivered", "Cancelled"].includes(o.status)
      );
      setOrders(activeOrders);

      const dailyData = historyRes.data?.dailyStats || [];
      setDailyStats(dailyData);

      const flattened = dailyData.flatMap((day) =>
        (day.orders || []).map((order) => ({
          ...order,
          deliveredAt: day.day,
        }))
      );
      setHistoryOrders(flattened);
    } catch (err) {
      if (err.response?.status === 401) logoutRider();
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [axios, logoutRider]);

  useEffect(() => {
    fetchData();
    if (!user?._id) return;
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;
    socket.emit("registerDeliveryBoy", user._id);

    socket.on("orderDelivered", (order) => {
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      setHistoryOrders((prev) => [order, ...prev]);
      fetchData(true);
      toast.success(`Success! Order Delivered.`);
    });

    return () => socket.disconnect();
  }, [user?._id, fetchData]);

  const stats = useMemo(() => {
    const totalEarnings = dailyStats.reduce((acc, day) => acc + (Number(day.earnings) || 0), 0);
    return {
      pending: orders.length,
      completed: historyOrders.length,
      earnings: new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2 }).format(totalEarnings),
    };
  }, [orders, historyOrders, dailyStats]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Performance</p>
          <p className="text-sm font-black text-emerald-400">{payload[0].value} Packages Done</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 font-black text-slate-400 animate-pulse uppercase tracking-[0.3em]">
      Syncing Terminal...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              Rider Hub
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time Terminal</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl hover:scale-95 transition-all font-black text-[10px]"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "SYNCING..." : "REFRESH FEED"}
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Clock className="text-blue-500" />} label="Live Tasks" value={stats.pending} color="blue" />
          <StatCard icon={<CheckCircle className="text-emerald-500" />} label="Completed" value={stats.completed} color="emerald" />
          <StatCard icon={<TrendingUp className="text-purple-500" />} label="Earnings" value={`${currency} ${stats.earnings}`} color="purple" />
          <StatCard icon={<Package className="text-orange-500" />} label="Total Jobs" value={orders.length + historyOrders.length} color="orange" />
        </div>

        {/* PERFORMANCE CHART */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase text-xs tracking-widest">
              <BarChart3 size={18} className="text-blue-600" /> Delivery Analytics
            </h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[9px] font-black text-slate-400">PAST</span></div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-slate-400">TODAY</span></div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="totalDelivered" radius={[6, 6, 0, 0]} barSize={24}>
                {dailyStats.map((entry, index) => {
                  const isToday = Number(entry.day) === new Date().getDate();
                  return <Cell key={`cell-${index}`} fill={isToday ? "#10B981" : "#3B82F6"} fillOpacity={isToday ? 1 : 0.6} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SECTION TITLE */}
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <History size={16} /> Order History ({historyOrders.length})
        </h2>

        {/* HISTORY LISTING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {historyOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 transition-all group">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Product Image Section */}
                <div className="relative">
                    <div className="w-full md:w-32 h-40 rounded-[1.8rem] bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center">
                        {order.items?.[0]?.image ? (
                            <img src={order.items[0].image} alt="product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <ShoppingBag size={40} className="text-slate-200" />
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-50">
                        <QRCodeCanvas value={order._id} size={42} />
                    </div>
                </div>

                {/* Info Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">#{order._id.slice(-6).toUpperCase()}</span>
                        <h4 className="text-lg font-black text-slate-900 uppercase leading-tight mt-1">
                            {order.address?.firstName} {order.address?.lastName}
                        </h4>
                    </div>
                    <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border bg-emerald-50 text-emerald-600 border-emerald-100">
                        {order.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <MapPin size={15} className="text-slate-400 mt-0.5" />
                        <p className="text-[11px] font-bold text-slate-500 leading-snug">
                            {order.address?.street}, {order.address?.city}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone size={14} className="text-emerald-500" />
                            <span className="text-[11px] font-black">{order.address?.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar size={14} />
                            <span className="text-[11px] font-black">{new Date(order.createdAt).toLocaleDateString("en-GB")}</span>
                        </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-2">
                          <History size={12} className="text-emerald-600" />
                          <span className="text-[9px] font-black text-emerald-600 uppercase">Job Completed</span>
                      </div>
                      <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {historyOrders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Package size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No order history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
    const colorStyles = {
        blue: "bg-blue-50 border-blue-100",
        emerald: "bg-emerald-50 border-emerald-100",
        purple: "bg-purple-50 border-purple-100",
        orange: "bg-orange-50 border-orange-100",
    };
    return (
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${colorStyles[color]}`}>{icon}</div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter">{value}</div>
        </div>
    );
};

export default AllOrders;