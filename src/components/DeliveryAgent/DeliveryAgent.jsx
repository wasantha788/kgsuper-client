import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

const Orders = () => {
  const { currency, axios, user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState("");
  const [otpModal, setOtpModal] = useState({ visible: false, orderId: "", otp: "" });

  // ---------------- FETCH SELLER ORDERS ----------------
  const fetchOrders = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get("/api/order/seller", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (data?.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
        setError(data.message || "No orders found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // ---------------- COPY ORDER ID ----------------
  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(""), 2000);
  };

  // ---------------- SEND OTP ----------------
  const sendOtp = async (orderId) => {
    try {
      const { data } = await axios.post(
        `/api/order/send-otp/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (data.success) {
        toast.success("OTP sent to customer email");
        setOtpModal({ visible: true, orderId, otp: "" });
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending OTP");
    }
  };

  // ---------------- VERIFY OTP & UPDATE STATUS ----------------
  const verifyOtpAndDeliver = async () => {
    try {
      const { orderId, otp } = otpModal;
      const { data } = await axios.post(
        `/api/order/verify-otp/${orderId}`,
        { otp },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (data.success) {
        toast.success("OTP verified. Order marked as Delivered.");
        setOtpModal({ visible: false, orderId: "", otp: "" });
        fetchOrders();
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("OTP verification failed");
    }
  };

  // ---------------- DELETE ORDER ----------------
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const { data } = await axios.delete(`/api/order/delete/${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (data.success) {
        toast.success("Order deleted");
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete request failed");
    }
  };

  // ---------------- HELPERS ----------------
  const statusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-600";
      case "Shipped":
        return "text-purple-600";
      case "Processing":
        return "text-blue-600";
      case "Cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const paymentStatus = (isPaid, status) => {
    if (status === "Cancelled")
      return <span className="text-red-600 font-semibold">Cancelled</span>;

    return isPaid ? (
      <span className="text-green-600 font-semibold">Paid</span>
    ) : (
      <span className="text-orange-500 font-semibold">Pending</span>
    );
  };

  // ---------------- UI ----------------
  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 md:px-10">
        <h2 className="text-3xl font-bold mb-6">Seller Orders</h2>

        {loading && <p className="text-gray-500">Loading orders...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-gray-500">No orders found.</p>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`p-6 bg-white rounded-xl border shadow-md flex flex-col md:flex-row gap-6 justify-between
              ${
                order.status === "Cancelled"
                  ? "border-red-400 bg-red-50 opacity-80 line-through"
                  : "border-gray-200 hover:shadow-lg"
              }`}
            >
              {/* LEFT */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-gray-600">
                    Order ID:
                    <span className="ml-2 font-semibold text-gray-800">
                      {order._id}
                    </span>
                  </p>

                  <button
                    onClick={() => copyOrderId(order._id)}
                    className="relative text-blue-600 text-sm font-medium"
                  >
                    Copy
                    {copiedOrderId === order._id && (
                      <span className="absolute -top-6 left-0 bg-black text-white text-xs px-2 py-1 rounded">
                        Copied!
                      </span>
                    )}
                  </button>
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
                      <span className="text-primary">x {item.quantity}</span>
                    </p>
                  </div>
                ))}

                <div className="text-sm text-gray-700">
                  <p className="font-semibold">
                    {order.address?.firstName} {order.address?.lastName}
                  </p>
                  <p>
                    {order.address?.street}, {order.address?.city}
                  </p>
                  <p>
                    {order.address?.state}, {order.address?.country}
                  </p>
                  <p>Phone: {order.address?.phone}</p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col md:items-end gap-3">
                <p className="text-xl font-bold">
                  {currency}
                  {order.amount.toFixed(2)}
                </p>

                {/* STATUS CONTROL */}
                <div className="flex flex-col gap-2">
                  <select
                    value={order.status}
                    disabled={
                      order.status === "Delivered" ||
                      order.status === "Cancelled"
                    }
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className={`border rounded px-3 py-1 font-semibold bg-white ${statusColor(
                      order.status
                    )}`}
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                  </select>

                  {order.status !== "Delivered" &&
                    order.status !== "Cancelled" && (
                      <button
                        onClick={() => sendOtp(order._id)}
                        className="px-4 py-1 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
                      >
                        Mark as Delivered (Send OTP)
                      </button>
                    )}

                  {order.status === "Delivered" && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded">
                      Delivered
                    </span>
                  )}
                </div>

                <p>Payment: {paymentStatus(order.isPaid, order.status)}</p>
                <p>
                  Date:{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-GB")}
                </p>

                <button
                  onClick={() => deleteOrder(order._id)}
                  className="mt-2 px-4 py-1 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                >
                  Delete Order
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* OTP MODAL */}
        {otpModal.visible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Enter OTP
              </h3>
              <input
                type="text"
                value={otpModal.otp}
                onChange={(e) =>
                  setOtpModal((prev) => ({ ...prev, otp: e.target.value }))
                }
                className="border border-gray-300 rounded-md p-3 w-full mb-4 text-center text-lg"
                placeholder="Enter OTP"
              />
              <button
                onClick={verifyOtpAndDeliver}
                className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
              >
                Verify OTP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
