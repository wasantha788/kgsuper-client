import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";

// ---------------- STATUS OPTIONS ----------------
const STATUS_OPTIONS = [
  "Order Placed",
  "Processing",
  "Packing",
  "Out for delivery",
  "Delivered",
];

const Orders = () => {
  const { currency, axios, user, isSeller, getSellerHeaders } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState("");
  const [processingOrders, setProcessingOrders] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [countdowns, setCountdowns] = useState({}); 
  const socketRef = useRef(null);
  const [liveDeliveryCount, setLiveDeliveryCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);

  // ---------------- HELPER FUNCTIONS (MISSING ONES ADDED HERE) ----------------
  
  const getUserIdFromToken = () => {
  try {
    // AppContext එකෙන් token එක ගන්න (හෝ localStorage වලින්)
    const token = localStorage.getItem("token"); // ඔබ token ගබඩා කරන තැන අනුව වෙනස් කරන්න
    if (!token) return null;
    const decoded = jwtDecode(token);
    // payload එකේ user ID තියෙන field එක හොයන්න (id, userId, _id, sub ආදී)
    return decoded.id || decoded.userId || decoded._id || decoded.sub || null;
  } catch {
    return null;
  }
};
  // 1. Payment Type එක අනුව badge එකේ පාට වෙනස් කරන function එක
  const getPaymentStyle = (paymentType) => {
    switch (paymentType?.toLowerCase()) {
      case "cod":
      case "cash on delivery":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "stripe":
      case "paypal":
      case "razorpay":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };
  
  
  // 2. Order ID එක copy කරගන්නා function එක
  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    toast.success("Order ID Copied!");
    setTimeout(() => setCopiedOrderId(""), 2000);
  };

  // 3. Order status එක අනුව select drop-down එකේ පාට වෙනස් කරන function එක
  const statusColor = (status) => {
    switch (status) {
      case "Order Placed": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Processing": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Packing": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Out for delivery": return "bg-orange-50 text-orange-700 border-orange-200";
      case "Delivered": return "bg-green-50 text-green-700 border-green-200";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // 4. Payment status එක text එකක් ලෙස පෙන්වන function එක
  const paymentStatusDisplay = (isPaid, status) => {
    if (isPaid) return "🟢 Paid";
    if (status === "Cancelled") return "🔴 Cancelled";
    return "⏳ Pending";
  };

  // ---------------- TIMER TICKER ----------------
  useEffect(() => {
  const ticker = setInterval(() => {
    setCountdowns((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (updated[id] > 1) {
          updated[id] -= 1;
        } else {
          // 🔥 මෙතනදී Backend එකට cancel කරන්න කියලා යවන්න
          if (socketRef.current) {
            socketRef.current.emit("cancel-delivery", { orderId: id });
          }
          
          // Frontend එකේ Status එක වෙනස් කරන්න
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
    const sellerHeaders = getSellerHeaders ? getSellerHeaders() : {};
    
    console.log("=== FETCHING NOW ===");
    console.log("Headers sent:", sellerHeaders);
    console.log("👤 Full User Object:", user);
    console.log("🆔 User ID fields:", { id: user?.id, _id: user?._id, userId: user?.userId });
    setLoading(true);
    try {
      const { data } = await axios.get("api/order/seller", {
        headers: sellerHeaders 
      });
      console.log("Server response data:", data);
      
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
        setError(data.message || "No orders found");
      }
    } catch (err) {
      console.error("Server error block:", err);
      setOrders([]);
      setError("Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GENERATE & SEND PDF EMAIL ----------------
  const sendEmailReceipt = async (order) => {
    if (!order.address?.email) {
      toast.error("No customer email found for this order.");
      return;
    }
    setSendingEmail(order._id);

    try {
      const doc = new jsPDF();
      const primaryColor = [26, 82, 118]; 

      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("KG SUPER SHOP", 14, 20);

      doc.setFontSize(9);
      doc.setTextColor(127, 140, 141); 
      doc.text("Premium Grocery & Daily Essentials", 14, 25);
      
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(14, 28, 196, 28);

      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);
      
      doc.text(`Order ID: #${order._id.toString().toUpperCase()}`, 14, 38);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 44);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Customer: ${order.address?.firstName} ${order.address?.lastName}`, 14, 50);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(26, 82, 118); 
      doc.text(`Email: ${order.address?.email}`, 14, 55);

      let subtotal = 0;
      const tableData = order.items?.map((item) => {
        const price = item.product?.offerPrice || item.product?.price || 0;
        const itemTotal = item.quantity * price;
        subtotal += itemTotal;
        return [
          item.product?.name || "Product",
          item.quantity,
          `${currency}${price.toFixed(2)}`,
          `${currency}${itemTotal.toFixed(2)}`,
        ];
      });

      const deliveryFee = subtotal >= 5000 ? 0 : 300;

      autoTable(doc, {
        startY: 62, 
        head: [["Description", "Qty", "Unit Price", "Total"]],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, fontSize: 10, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' },
        },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text("Subtotal:", 145, finalY, { align: 'right' });
      doc.setTextColor(44, 62, 80);
      doc.text(`${currency}${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });

      doc.setTextColor(127, 140, 141);
      doc.text("Delivery Fee:", 145, finalY + 7, { align: 'right' });
      doc.setTextColor(44, 62, 80);
      doc.text(deliveryFee === 0 ? "FREE" : `${currency}${deliveryFee.toFixed(2)}`, 190, finalY + 7, { align: 'right' });

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("GRAND TOTAL:", 145, finalY + 17, { align: 'right' });
      doc.text(`${currency}${order.amount.toFixed(2)}`, 190, finalY + 17, { align: 'right' });

      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Thanks for Contacting KG Super Shop!", 105, pageHeight - 25, { align: "center" });
      
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.text("This is a computer-generated receipt for your records.", 105, pageHeight - 20, { align: "center" });

      const pdfBase64 = doc.output('datauristring').split(',')[1];

      const { data } = await axios.post(
        "/api/order/send-receipt",
        {
          orderId: order._id,
          email: order.address.email,
          orderDetails: order,
          pdfData: pdfBase64,
          fileName: `Receipt_${order._id}.pdf`
        },
        { headers: getSellerHeaders() }
      );

      if (data.success) {
        toast.success("Receipt emailed successfully!");
      }
    } catch (err) {
      console.error("PDF Send Error:", err);
      toast.error(err.response?.data?.message || "Failed to send PDF receipt");
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

  // ---------------- SOCKET.IO HOOK ----------------
 useEffect(() => {
  // 1️⃣ User ID එක හොයන්න: ප්‍රථමයෙන් user Object එකෙන්, නැතිනම් Token එකෙන්
  const userId = user?._id || user?.id || user?.userId || getUserIdFromToken();
  
  if (!userId) {
    console.log("⏳ Waiting for user ID...");
    return;
  }

  console.log("🔌 Connecting to Socket with user ID:", userId);

  const socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true,
  });
  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("✅ Socket Connected! ID:", socket.id);
    setIsLive(true);
    setSocketConnected(true);
    socket.emit("join_seller");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket Connection Error:", err.message);
    setSocketConnected(false);
  });

  socket.on("disconnect", () => {
    setIsLive(false);
    setSocketConnected(false);
  });

  // ... අනෙකුත් Listeners (deliveryBoyCount, orderAcceptedByDelivery, orderUnaccepted)

 






  socket.on("deliveryBoyCount", (count) => {
    setLiveDeliveryCount(count);
  });

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
}, [user?._id, user?.id, user?.userId]); // Dependencies Update කරන්න


  useEffect(() => {
    fetchOrders();
  }, [user?._id]);

  // ---------------- ACTIONS ----------------
   const sendToDelivery = async (order) => {
  if (!socketRef.current || !socketRef.current.connected) {
    toast.error("Socket not connected. Please wait and try again.");
    return;
    }

    if (processingOrders.includes(order._id)) return;

    setProcessingOrders((prev) => [...prev, order._id]);
    setCountdowns((prev) => ({ ...prev, [order._id]: 10 }));
    setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, status: "Out for delivery" } : o));
    
    socketRef.current.emit("send-to-delivery", { order });
    console.log("Emitted 'send-to-delivery' event for order:", order._id);

  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, { status: newStatus }, { headers: getSellerHeaders() });
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const { data } = await axios.delete(`/api/order/delete/${orderId}`, { headers: getSellerHeaders() });
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
              <span className="text-xs font-medium text-gray-600">
                {isLive ? `Live Riders: ${liveDeliveryCount}` : "Offline"}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={downloadPaidPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 font-semibold text-sm transition-all">Download Paid PDF</button>
            <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-semibold">Refresh</button>
          </div>
        </div>

        <div className="space-y-6">
         {orders.map((order) => (
          <div
            key={order._id}
            className={`p-6 bg-white rounded-xl border shadow-md flex flex-col md:flex-row gap-6 justify-between ${
              order.status === "Cancelled"
                ? "border-red-400 bg-red-50 opacity-80"
                : "border-gray-200"
            }`}
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-gray-600 text-sm">
                  Order ID:{" "}
                  <span className="font-bold text-gray-800">{order._id}</span>
                </p>
                <button
                  onClick={() => copyOrderId(order._id)}
                  className="text-blue-500 text-xs font-bold uppercase"
                >
                  {copiedOrderId === order._id ? "Copied!" : "Copy"}
                </button>
                <span
                  className={`px-2 py-0.5 text-[10px] font-black rounded border ${getPaymentStyle(
                    order.paymentType
                  )}`}
                >
                  {order.paymentType?.toUpperCase() || "ONLINE"}
                </span>
              </div>


                {order.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gray-50 p-2 rounded"
                  >
                    <img
                      src={item.product?.image?.[0] || assets.box_icon}
                      className="w-16 h-16 rounded object-cover"
                      alt=""
                    />
                    <p className="font-medium">
                      {item.product?.name}{" "}
                      <span className="text-blue-600 font-bold ml-1">
                        x{item.quantity}
                      </span>
                    </p>
                  </div>
                ))}



                <div className="text-sm text-gray-700">
                  <p className="font-bold">
                    {order.address?.firstName} {order.address?.lastName}
                  </p>
                  <p>
                    {order.address?.street}, {order.address?.city}
                  </p>
                  <p className="text-blue-600 font-medium italic">
                    {order.address?.email}
                  </p>
                </div>



                {order.assignedDeliveryBoy && (
                  <div className="p-2 mt-1 bg-green-50 border rounded text-sm text-gray-700">
                    <p>🚴 Delivery Boy: {order.assignedDeliveryBoy.name}</p>
                    <p>📞 Phone: {order.assignedDeliveryBoy.phone}</p>
                    <p>🚗 Vehicle: {order.assignedDeliveryBoy.vehicleType}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:items-end gap-3 min-w-50">
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
                        disabled={!socketConnected || processingOrders.includes(order._id)}
                        className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🚀 SEND TO DELIVERY
                      </button>
                    )
                  )}

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