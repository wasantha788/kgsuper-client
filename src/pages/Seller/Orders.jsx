import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---------------- STATUS OPTIONS ----------------
const STATUS_OPTIONS = [
  "Order Placed",
  "Processing",
  "Packing",
  "Out for delivery",
  "Delivered",
];

const Orders = () => {
  const { currency, axios, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState("");
  const [processingOrders, setProcessingOrders] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [countdowns, setCountdowns] = useState({}); // Stores { orderId: seconds Remaining }
  const socketRef = useRef(null);

  const token = user?.token;

  // ---------------- TIMER TICKER (Handles search timeout) ----------------
  useEffect(() => {
    const ticker = setInterval(() => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          if (updated[id] > 1) {
            updated[id] -= 1;
          } else {
            // If time runs out
            setOrders((prevOrders) =>
              prevOrders.map((o) =>
                o._id === id ? { ...o, status: "Order Placed" } : o
              )
            );
            delete updated[id];
            toast.error(`No rider found for order ${id.slice(-5)}`);
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const { data } = await axios.get("/api/order/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setOrders(data.orders || []);
      else setOrders([]);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GENERATE & SEND PDF EMAIL ----------------
  const sendEmailReceipt = async (order) => {
    if (!order.address?.email) return toast.error("No customer email found.");
    setSendingEmail(order._id);

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("KGSUPER RECEIPT", 14, 20);
      doc.setFontSize(10);
      doc.text(`Order ID: ${order._id}`, 14, 28);
      doc.text(`Customer: ${order.address?.firstName} ${order.address?.lastName}`, 14, 34);

      const tableData = order.items?.map((item) => [
        item.product?.name || "Product",
        item.quantity,
        `${currency}${item.product?.price || 0}`,
        `${currency}${(item.quantity * (item.product?.price || 0)).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Product", "Qty", "Price", "Total"]],
        body: tableData,
      });

      doc.text(`Grand Total: ${currency}${order.amount.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);

      const pdfBase64 = doc.output('datauristring').split(',')[1];

      const { data } = await axios.post("/api/order/send-receipt", { 
        email: order.address.email, 
        pdfData: pdfBase64, 
        fileName: `Receipt_${order._id.slice(-6)}.pdf`
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (data.success) toast.success("Receipt emailed successfully!");
    } catch (err) {
      toast.error("Failed to send email receipt.");
    } finally {
      setSendingEmail(null);
    }
  };

  // ---------------- SOCKET.IO (Real-time events) ----------------
  useEffect(() => {
    if (!user?._id) return;
    // UPDATED: Pointing to Railway Production URL
    const socket = io("https://kgsuper-server-production.up.railway.app", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));
    socket.emit("join_seller");

    socket.on("orderAcceptedByDelivery", ({ orderId, deliveryBoy }) => {
      setCountdowns((prev) => { const u = { ...prev }; delete u[orderId]; return u; });
      setOrders((prev) => prev.map((o) => 
        o._id === orderId ? { ...o, assignedDeliveryBoy: deliveryBoy, status: "Out for delivery" } : o
      ));
      toast.success(`✅ Rider ${deliveryBoy.name} accepted!`, { duration: 4000 });
    });

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => { fetchOrders(); }, [user]);

  // ---------------- ACTIONS ----------------
  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
        toast.success(`Status: ${status}`);
      }
    } catch (err) { toast.error("Update failed"); }
  };

  const sendToDelivery = async (order) => {
    if (!socketRef.current) return toast.error("Socket disconnected");
    
    // UI Feedback
    setCountdowns(prev => ({ ...prev, [order._id]: 30 })); 
    socketRef.current.emit("send-to-delivery", { order });
    
    try {
      await axios.put(`/api/order/status/${order._id}`, { status: "Out for delivery" }, { headers: { Authorization: `Bearer ${token}` } });
      toast("Searching for riders...", { icon: '🔍' });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const { data } = await axios.delete(`/api/order/delete/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success("Deleted");
        setOrders(prev => prev.filter(o => o._id !== orderId));
      }
    } catch (err) { toast.error("Delete failed"); }
  };

  // ---------------- HELPERS ----------------
  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(""), 2000);
  };

  const getPaymentStyle = (type) => type?.toLowerCase() === "cod" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Order Dashboard</h2>
          <div className="flex items-center gap-3">
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${isLive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {isLive ? "● SYSTEM LIVE" : "○ OFFLINE"}
             </div>
             <button onClick={fetchOrders} className="bg-white border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all">Refresh</button>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:flex gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono font-bold text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
                  <button onClick={() => copyOrderId(order._id)} className="text-[10px] text-blue-500 font-bold underline">{copiedOrderId === order._id ? "COPIED" : "COPY ID"}</button>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getPaymentStyle(order.paymentType)}`}>{order.paymentType || "ONLINE"}</span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.product?.image?.[0]} className="w-10 h-10 rounded object-cover bg-gray-100" alt="" />
                      <p className="text-sm font-medium text-gray-700">{item.product?.name} <span className="text-blue-600">x{item.quantity}</span></p>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500">
                  <p className="font-bold text-gray-700">{order.address.firstName} {order.address.lastName}</p>
                  <p>{order.address.street}, {order.address.city}</p>
                </div>
              </div>

              <div className="flex flex-col md:items-end justify-between gap-4 mt-4 md:mt-0 min-w-[200px]">
                <p className="text-xl font-black text-gray-900">{currency}{order.amount.toFixed(2)}</p>
                
                <div className="w-full space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Status Control</label>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm font-bold bg-white outline-none"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => sendEmailReceipt(order)}
                      disabled={sendingEmail === order._id || !order.isPaid}
                      className="w-full py-2 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-700 disabled:bg-gray-200"
                    >
                      {sendingEmail === order._id ? "SENDING..." : "📩 EMAIL RECEIPT"}
                    </button>

                    {countdowns[order._id] ? (
                      <div className="w-full py-2 bg-orange-500 text-white text-[10px] font-black rounded text-center animate-pulse">
                         SEARCHING RIDERS ({countdowns[order._id]}s)
                      </div>
                    ) : (
                      !order.assignedDeliveryBoy && order.status !== "Cancelled" && (
                        <button 
                          onClick={() => sendToDelivery(order)}
                          className="w-full py-2 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700"
                        >
                          🚀 DISPATCH TO DELIVERY
                        </button>
                      )
                    )}

                    {order.assignedDeliveryBoy && (
                      <div className="w-full py-2 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold rounded text-center">
                        RIDER: {order.assignedDeliveryBoy.name.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;