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

  // ---------------- TIMER TICKER ----------------
  useEffect(() => {
    const ticker = setInterval(() => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          if (updated[id] > 1) {
            updated[id] -= 1;
          } else {
            setOrders((prevOrders) =>
              prevOrders.map((o) =>
                o._id === id ? { ...o, status: "Order Placed" } : o
              )
            );
            delete updated[id];
            toast.error("No delivery boy accepted in time.");
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
      else {
        setOrders([]);
        setError(data.message || "No orders found");
      }
    } catch (err) {
      setOrders([]);
      setError("Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

     // ---------------- GENERATE & sendEmailReceipt  ----------------
          const sendEmailReceipt = async (order) => {
  // Since you are using 'axios' from useAppContext, it already uses withCredentials: true
  // and we will pass the headers explicitly just to be safe.
  
  const activeToken = localStorage.getItem("token") || 
                      localStorage.getItem("sellerToken");

  if (!activeToken) {
    toast.error("Seller session not found. Please log in again.");
    return;
  }

  setSendingEmail(order._id);

  try {
    const doc = new jsPDF();
    // ... your PDF generation logic ...
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    const { data } = await axios.post(
      "https://kgsuper-server-production.up.railway.app/api/order/send-receipt", // Use relative path since baseURL is set
      {
        email: order.address.email,
        pdfData: pdfBase64,
        fileName: `Receipt_${order._id}.pdf`
      },
      {
        headers: { Authorization: `Bearer ${activeToken}` }
      }
    );

    if (data.success) toast.success("PDF Receipt sent!");
  } catch (err) {
    toast.error(err.response?.data?.message || "Email failed");
  } finally {
    setSendingEmail(null);
  }
};
   
  // ---------------- DOWNLOAD PDF ----------------
  const downloadPaidPDF = () => {
    try {
      const paidOrders = orders.filter((order) => order.isPaid === true);
      if (paidOrders.length === 0) {
        toast.error("No paid orders found to export.");
        return;
      }

      const totalPaidAmount = paidOrders.reduce((sum, order) => sum + order.amount, 0);
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Paid Orders Report", 14, 20);

      const tableData = paidOrders.map((order) => [
        order._id,
        `${order.address?.firstName || ""} ${order.address?.lastName || ""}`,
        order.items?.map((i) => `${i.product?.name || "Product"} (x${i.quantity})`).join(", "),
        `${currency}${order.amount.toFixed(2)}`,
        new Date(order.createdAt).toLocaleDateString("en-GB"),
      ]);

      autoTable(doc, {
        startY: 32,
        head: [["Order ID", "Customer", "Items", "Total", "Date"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text(`Total Paid Amount: ${currency}${totalPaidAmount.toFixed(2)}`, 14, finalY);

      doc.save(`Paid_Orders_${Date.now()}.pdf`);
      toast.success("PDF Downloaded!");
    } catch (err) {
      toast.error("Error generating PDF.");
    }
  };

  // ---------------- SOCKET.IO ----------------
  useEffect(() => {
    if (!user?._id) return;
    const socket = io("https://kgsuper-server-production.up.railway.app", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));
    socket.emit("join_seller");

    socket.on("orderAcceptedByDelivery", ({ orderId, deliveryBoy }) => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, assignedDeliveryBoy: deliveryBoy, status: "Out for delivery" }
            : o
        )
      );
      toast.success(`✅ Order accepted by ${deliveryBoy.name}`);
    });

    socket.on("orderUnaccepted", (orderId) => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "Order Placed" } : o))
      );
      toast.error(`⚠️ No delivery boy accepted order ${orderId}.`);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => { fetchOrders(); }, [user]);

  // ---------------- HELPERS ----------------
  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(""), 2000);
  };

  const getPaymentStyle = (type) => {
    const isCod = type?.toLowerCase() === "cod";
    return isCod ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200";
  };

  const statusColor = (status) => {
    switch (status) {
      case "Order Placed": return "text-green-600";
      case "Packing": return "text-purple-600";
      case "Processing":
      case "Out for delivery": return "text-blue-600";
      case "Delivered": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const paymentStatusDisplay = (isPaid, status) => {
    if (status === "Cancelled") return <span className="text-red-600 font-semibold">Cancelled</span>;
    return isPaid ? <span className="text-green-600 font-semibold">Paid</span> : <span className="text-orange-500 font-semibold">Pending</span>;
  };

  // ---------------- ACTIONS ----------------
  const updateStatus = async (orderId, status) => {
    if (processingOrders.includes(orderId)) return;
    setProcessingOrders((prev) => [...prev, orderId]);
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
        toast.success(`Status updated to ${status}`);
      }
    } catch (err) { toast.error("Failed to update status"); }
    finally { setProcessingOrders((prev) => prev.filter((id) => id !== orderId)); }
  };

  const sendToDelivery = async (order) => {
    if (!socketRef.current || processingOrders.includes(order._id)) return;
    setProcessingOrders((prev) => [...prev, order._id]);
    setCountdowns((prev) => ({ ...prev, [order._id]: 10 }));
    setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, status: "Out for delivery" } : o));
    socketRef.current.emit("send-to-delivery", { order });

    try {
      await axios.put(`/api/order/status/${order._id}`, { status: "Out for delivery" }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Searching for rider...`);
    } catch (err) {
      setCountdowns((prev) => { const u = { ...prev }; delete u[order._id]; return u; });
      toast.error("Failed to initiate delivery");
    } finally {
      setProcessingOrders((prev) => prev.filter((id) => id !== order._id));
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const { data } = await axios.delete(`/api/order/delete/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success("Deleted");
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (err) { toast.error("Delete failed"); }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Seller Orders</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-full shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
              <span className="text-xs font-medium text-gray-600">{isLive ? "Live" : "Offline"}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={downloadPaidPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 font-semibold text-sm transition-all">Download Paid PDF</button>
            <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-semibold">Refresh</button>
          </div>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className={`p-6 bg-white rounded-xl border shadow-md flex flex-col md:flex-row gap-6 justify-between ${order.status === "Cancelled" ? "border-red-400 bg-red-50 opacity-80" : "border-gray-200"}`}>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-gray-600 text-sm">Order ID: <span className="font-bold text-gray-800">{order._id}</span></p>
                  <button onClick={() => copyOrderId(order._id)} className="text-blue-500 text-xs font-bold uppercase">{copiedOrderId === order._id ? "Copied!" : "Copy"}</button>
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded border ${getPaymentStyle(order.paymentType)}`}>
                    {order.paymentType?.toUpperCase() || "ONLINE"}
                  </span>
                </div>
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                    <img src={item.product?.image?.[0] || assets.box_icon} className="w-16 h-16 rounded object-cover" alt="" />
                    <p className="font-medium">{item.product?.name} <span className="text-blue-600 font-bold ml-1">x{item.quantity}</span></p>
                  </div>
                ))}
                <div className="text-sm text-gray-700">
                  <p className="font-bold">{order.address?.firstName} {order.address?.lastName}</p>
                  <p>{order.address?.street}, {order.address?.city}</p>
                  <p className="text-blue-600 font-medium italic">{order.address?.email}</p>
                </div>
                {/* DELIVERY BOY INFO */}
                {order.assignedDeliveryBoy && (
                  <div className="p-2 mt-1 bg-green-50 border rounded text-sm text-gray-700">
                    <p>🚴 Delivery Boy: {order.assignedDeliveryBoy.name}</p>
                    <p>📞 Phone: {order.assignedDeliveryBoy.phone}</p>
                    <p>🚗 Vehicle: {order.assignedDeliveryBoy.vehicleType}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:items-end gap-3 min-w-[200px]">
                <p className="text-xl font-bold">{currency}{order.amount.toFixed(2)}</p>

                <select
                  value={order.status}
                  disabled={order.status === "Cancelled" || processingOrders.includes(order._id)}
                  className={`w-full border rounded px-3 py-1 font-bold ${statusColor(order.status)}`}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="text-xs text-right text-gray-500 space-y-1">
                  <p>Payment: {paymentStatusDisplay(order.isPaid, order.status)}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
                </div>

                <div className="w-full flex flex-col gap-2 mt-2">
                  {/* 1. EMAIL RECEIPT BUTTON: Shows if paid, else shows pending label */}
                  {order.isPaid ? (
                    <button
                      onClick={() => sendEmailReceipt(order)}
                      disabled={sendingEmail === order._id}
                      className="w-full py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors"
                    >
                      {sendingEmail === order._id ? "SENDING PDF..." : "📩 EMAIL PDF RECEIPT"}
                    </button>
                  ) : (
                    <div className="w-full py-1.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded text-center border border-gray-200">
                      PAYMENT PENDING
                    </div>
                  )}

                  {/* 2. DELIVERY LOGIC: Show countdown OR show button OR show rider name */}
                  {countdowns[order._id] ? (
                    <div className="w-full py-1.5 bg-orange-500 text-white text-[10px] font-black rounded text-center animate-pulse">
                      SEARCHING RIDER ({countdowns[order._id]}s)
                    </div>
                  ) : order.assignedDeliveryBoy ? (
                    <div className="w-full py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded text-center border border-blue-200">
                      RIDER: {order.assignedDeliveryBoy.name.toUpperCase()}
                    </div>
                  ) : (
                    order.status === "Order Placed" && (
                      <button
                        onClick={() => sendToDelivery(order)}
                        className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-all"
                      >
                        🚀 SEND TO DELIVERY
                      </button>
                    )
                  )}

                  {/* 3. DELETE BUTTON */}
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="mt-2 px-4 py-1 bg-red-600 text-white font-semibold rounded text-xs opacity-80 hover:opacity-100"
                  >
                    Delete Order
                  </button>
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