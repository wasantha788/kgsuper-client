import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../../context/AppContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const STATUS_OPTIONS = [
  "Processing",
  "Packing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

/* ---------------- ORDER PREVIEW (Pure UI) ---------------- */
const OrderPreview = ({ order, currency }) => {
  return (
    <div className="space-y-3 text-sm text-gray-700">
      <div>
        <p className="font-bold text-lg text-gray-900">
          {order.address?.firstName} {order.address?.lastName}
        </p>
        <p className="text-gray-500">
          {order.address?.street}, {order.address?.city}
        </p>
        <p className="text-blue-600 font-semibold mt-1">
          📧 {order.address?.email || "No Email Provided"}
        </p>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-2">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <img
              src={item.product?.image?.[0] || "/placeholder.png"}
              className="w-12 h-12 rounded object-cover border bg-white"
              alt="product"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {item.product?.name} <span className="text-blue-600">× {item.quantity}</span>
              </p>
              <p className="text-[11px] text-gray-500">Phone: {order.address?.phone}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
        <div>
           <p className="text-[10px] text-gray-400 uppercase font-bold">Total Amount</p>
           <p className="font-black text-lg text-green-700">
            {currency}{Number(order.amount).toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Status</p>
          <span className={`text-xs font-bold ${order.isPaid ? "text-green-600" : "text-orange-500"}`}>
            {order.isPaid ? "● PAID" : "○ PAYMENT PENDING"}
          </span>
          <p className="text-[10px] text-gray-500 font-medium">via {order.paymentType || "COD"}</p>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN DASHBOARD ---------------- */
const DeliveryDashboard = () => {
  const { user, currency, backendUrl } = useAppContext();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [otpOrderId, setOtpOrderId] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // SOCKETS & REFRESH LOGIC
  useEffect(() => {
    if (!user?._id) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL || backendUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
        socket.emit("registerDeliveryBoy", user._id);
    });

    socket.on("myOrders", (data) => {
      setOrders(data);
      setLoading(false);
    });

    // INSTANT REFRESH ON NEW ORDER
    socket.on("newDeliveryOrder", (order) => {
      // 1. Immediately request a full data refresh from server
      socket.emit("registerDeliveryBoy", user._id); 
      
      // 2. Optimistically add it to UI while waiting for refresh
      setOrders((prev) => prev.some((o) => o._id === order._id) ? prev : [order, ...prev]);
      
      toast.success("New delivery request nearby! 🚴", { icon: '📦' });
    });

    socket.on("orderUpdated", (updated) => {
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    });

    // 5-MINUTE SAFETY REFRESH (300,000 ms)
    const interval = setInterval(() => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("registerDeliveryBoy", user._id);
        }
    }, 300000);

    return () => {
        if (socketRef.current) socketRef.current.disconnect();
        clearInterval(interval);
    };
  }, [user?._id, backendUrl]);

  const acceptOrder = (orderId) => {
    if (!socketRef.current) return;
    socketRef.current.emit("accept-order", { orderId, deliveryBoyId: user._id });
    toast.success("Order accepted!");
  };

  const rejectOrder = (orderId) => {
    if (!socketRef.current) return;
    socketRef.current.emit("reject-order", { orderId, deliveryBoyId: user._id });
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  const markAsPaid = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryToken"); 
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/order/${orderId}/send-payment-otp`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server responded with ${res.status}`);
      setOtpOrderId(orderId);
      setShowOtpModal(true);
      toast.success("OTP sent to customer's email");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const verifyOtp = async () => {
    if (emailOtp.length < 4) return toast.error("Enter valid OTP");
    try {
      setVerifying(true);
      const token = localStorage.getItem("deliveryToken");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/order/${otpOrderId}/verify-payment-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: emailOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders((prev) => prev.map((o) => o._id === otpOrderId ? { ...o, isPaid: true } : o));
      toast.success("Payment Verified!");
      setShowOtpModal(false);
      setEmailOtp("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const myOrders = orders.filter(o => 
    o.assignedDeliveryBoy === user._id || o.assignedDeliveryBoy?._id === user._id
  );

  const pendingOrders = orders.filter(o => 
    !o.assignedDeliveryBoy && o.status === "Out for delivery"
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Syncing live deliveries...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">DELIVERY FEED 🚐</h2>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => socketRef.current.emit("registerDeliveryBoy", user._id)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                title="Manual Refresh"
            >
                🔄
            </button>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black animate-pulse">LIVE CONNECTED</div>
        </div>
      </header>

      {/* SECTION: NEW BROADCASTS */}
      {pendingOrders.length > 0 && (
          <section className="mb-10">
              <h3 className="text-xs font-black text-orange-500 mb-4 tracking-widest uppercase">New Opportunities</h3>
              {pendingOrders.map(order => (
                <div key={order._id} className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-5 mb-6 shadow-sm">
                    <OrderPreview order={order} currency={currency} />
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => acceptOrder(order._id)} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all">Accept Order</button>
                        <button onClick={() => rejectOrder(order._id)} className="px-6 bg-white border border-gray-200 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50">Decline</button>
                    </div>
                </div>
              ))}
          </section>
      )}

      {/* SECTION: ASSIGNED TO ME */}
      <h3 className="text-xs font-black text-gray-400 mb-4 tracking-widest uppercase">Active Deliveries</h3>
      {myOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No active tasks. New orders will appear here.</p>
          </div>
      ) : (
          myOrders.map(order => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-md hover:shadow-lg transition-shadow">
                <OrderPreview order={order} currency={currency} />
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                    <select
                        value={order.status}
                        onChange={(e) => socketRef.current.emit("update-order-status", { orderId: order._id, status: e.target.value })}
                        className="flex-1 min-w-[140px] border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <Link to={`/delivery/order/${order._id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2">
                        TRACKING & CHAT
                    </Link>

                    {order.status === "Delivered" && !order.isPaid && (
                        <button onClick={() => markAsPaid(order._id)} className="w-full bg-green-600 text-white py-3 rounded-xl font-black mt-2 shadow-lg shadow-green-100">
                            COLLECT PAYMENT (OTP)
                        </button>
                    )}
                </div>
            </div>
          ))
      )}

      {/* OTP MODAL REMOVED FOR BREVITY - SAME AS YOUR ORIGINAL */}
    </div>
  );
};

export default DeliveryDashboard;