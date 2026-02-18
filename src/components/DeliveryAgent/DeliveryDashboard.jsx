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

/* ---------------- ORDER PREVIEW ---------------- */
const OrderPreview = ({ order, currency }) => {
  return (
    <div className="space-y-3 text-sm text-gray-700">
      <div>
        <p className="font-bold">
          {order.address?.firstName} {order.address?.lastName}
        </p>
        <p>
          {order.address?.street}, {order.address?.city}
        </p>
        <p className="text-blue-600 font-bold">
          📧 {order.address?.email || "Customer Email"}
        </p>
      </div>

      <div className="border-t pt-2 space-y-2">
        {order.items?.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-gray-50 p-2 rounded"
          >
            <img
              src={item.product?.image?.[0] || "/placeholder.png"}
              className="w-14 h-14 rounded object-cover border"
              alt="product"
            />
            <div className="flex-1">
              <p className="font-medium">
                {item.product?.name} × {item.quantity}
              </p>
              <p>Phone: {order.address?.phone}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-2">
        <p className="font-bold">
          Total: {currency}
          {Number(order.amount).toFixed(2)}
        </p>
        <p>
          Payment Status:{" "}
          <span
            className={
              order.isPaid
                ? "text-green-600 font-bold"
                : "text-orange-500 font-bold"
            }
          >
            {order.isPaid ? "PAID" : "PENDING"}
          </span>
        </p>
        <p>
          Payment Type:{" "}
          <span className="font-bold">
            {order.paymentType || "COD"}
          </span>
        </p>
      </div>
    </div>
  );
};

const DeliveryDashboard = () => {
  const { user, currency } = useAppContext();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [otpOrderId, setOtpOrderId] = useState(null);
  const [verifying, setVerifying] = useState(false);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    if (!user?._id) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
      withCredentials: "include",
    });

    socketRef.current = socket;

    socket.emit("registerDeliveryBoy", user._id);

    socket.on("myOrders", (data) => {
      setOrders(data);
      setLoading(false);
    });

    socket.on("newDeliveryOrder", (order) => {
      setOrders((prev) =>
        prev.some((o) => o._id === order._id)
          ? prev
          : [order, ...prev]
      );
      toast.success("New delivery request 🚴");
    });

    socket.on("orderUpdated", (updated) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
    });

    return () => socket.disconnect();
  }, [user]);

  /* ---------------- ACCEPT / REJECT ---------------- */
  const acceptOrder = (orderId) => {
    socketRef.current.emit("accept-order", {
      orderId,
      deliveryBoyId: user._id,
    });
    toast.success("Order accepted ✅");
  };

  const rejectOrder = (orderId) => {
    socketRef.current.emit("reject-order", {
      orderId,
      deliveryBoyId: user._id,
    });
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
    toast.error("Order rejected ❌");
  };

  /* ---------------- SEND EMAIL OTP ---------------- */
  const markAsPaid = async (orderId) => {
    try {
      const token = localStorage.getItem("deliveryToken");
      if (!token) throw new Error("Please login again");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/order/${orderId}/send-payment-otp`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOtpOrderId(orderId);
      setShowOtpModal(true);
      toast.success("Email OTP sent 📧");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async () => {
    if (emailOtp.length < 4)
      return toast.error("Invalid OTP");

    try {
      setVerifying(true);
      const token = localStorage.getItem("deliveryToken");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/order/${otpOrderId}/verify-payment-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp: emailOtp }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === otpOrderId ? { ...o, isPaid: true } : o
        )
      );

      toast.success("Payment verified ✅");
      setShowOtpModal(false);
      setEmailOtp("");
      setOtpOrderId(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const myOrders = orders.filter(
    (o) =>
      o.assignedDeliveryBoy &&
      (o.assignedDeliveryBoy === user._id ||
        o.assignedDeliveryBoy?._id === user._id)
  );

  const pendingOrders = orders.filter(
    (o) => !o.assignedDeliveryBoy
  );

  if (loading)
    return <p className="text-center mt-10">Loading…</p>;

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      <h2 className="text-2xl font-bold mb-6">
        Delivery Dashboard 🚐
      </h2>

      {/* NEW ORDERS */}
      {pendingOrders.map((order) => (
        <div
          key={order._id}
          className="bg-orange-50 border rounded-xl p-4 mb-4"
        >
          <OrderPreview order={order} currency={currency} />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => acceptOrder(order._id)}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold"
            >
              Accept
            </button>
            <button
              onClick={() => rejectOrder(order._id)}
              className="flex-1 bg-white border text-red-600 py-2 rounded-lg font-bold"
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      {/* MY ORDERS */}
      {myOrders.map((order) => (
        <div
          key={order._id}
          className="bg-white border rounded-xl p-5 mb-4 shadow"
        >
          <OrderPreview order={order} currency={currency} />

          <div className="flex gap-4 mt-4 items-center">
            <select
              value={order.status}
              onChange={(e) =>
                socketRef.current.emit("update-order-status", {
                  orderId: order._id,
                  status: e.target.value,
                })
              }
              className="border px-3 py-2 rounded"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <Link
              to={`/delivery/order/${order._id}`}
              className="bg-green-900 text-white px-4 py-2 rounded-lg text-xs font-black"
            >
              CHAT & TRACK
            </Link>

            {order.status === "Delivered" && !order.isPaid && (
              <button
                onClick={() => markAsPaid(order._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      ))}

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80">
            <h3 className="text-lg font-bold text-center mb-4">
              Email OTP Verification
            </h3>

            <input
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              className="w-full border px-4 py-3 rounded-lg text-center font-bold"
              placeholder="Enter OTP"
            />

            <button
              onClick={verifyOtp}
              disabled={verifying}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold"
            >
              {verifying ? "Verifying…" : "Verify OTP"}
            </button>

            <button
              onClick={() => setShowOtpModal(false)}
              className="w-full mt-2 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
