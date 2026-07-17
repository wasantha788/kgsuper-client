import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  // ✅ getDeliveryHeaders භාවිතා කරන්න, axios instance එක ගන්න
  const { currency, getDeliveryHeaders, axios, user } = useAppContext(); 

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchOrder = async (silent = false) => {
    const currentUserId = user?._id || user?.id;
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);

      // ✅ Base URL එක axios instance එකෙන්ම එනවා
      const { data } = await axios.get(`/api/order/${orderId}`, { 
        headers: getDeliveryHeaders(), // ✅ නිවැරදි headers
        withCredentials: true 
      });

      if (data.success) {
        setOrder(data.order);
      } else {
        if (!silent) toast.error(data.message || "Failed to fetch order");
      }
    } catch (error) {
      if (!silent) {
        toast.error(error.response?.data?.message || "Error fetching order");
      }
      console.error("Tracking Error:", error.response || error);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  };

  // Initial load + auto-refresh
  useEffect(() => {
    if (!orderId) return;

    // ✅ Silent = false for initial load
    fetchOrder(false);
    
    const interval = setInterval(() => {
      // ✅ Silent = true for background refresh (no toasts)
      fetchOrder(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, user]); // user changes -> re-run

  const navigateToChatRequest = () => {
    if (!order) return;
    navigate(`/delivery/chat-request/${order._id}`);
  };

  if (loading && isFirstLoad) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg">Order not found or unauthenticated.</p>
      </div>
    );
  }

  const statusProgress = {
    "Order Placed": 20,
    Processing: 40,
    Packing: 60,
    "Out for delivery": 80,
    Delivered: 100,
  };

  const steps = [
    "Order Placed",
    "Processing",
    "Packing",
    "Out for delivery",
    "Delivered",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Track Order</h1>

      <div className="mb-4">
        <QRCodeCanvas value={order._id} size={128} />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Order ID: <span className="font-mono text-gray-700">{order._id}</span>
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl bg-gray-200 rounded-full h-4 mb-8">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${
            order.status === "Cancelled" ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${statusProgress[order.status] || 0}%` }}
        />
      </div>

      {/* Status Steps */}
      <div className="w-full max-w-3xl flex justify-between text-sm font-medium text-gray-600 mb-8">
        {steps.map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center text-white ${
                steps.indexOf(order.status) >= steps.indexOf(step)
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              {steps.indexOf(order.status) >= steps.indexOf(step) ? "✓" : ""}
            </div>
            <span className="text-center">{step}</span>
          </div>
        ))}
      </div>

      {/* Order Items */}
      <div className="w-full max-w-3xl bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-4 items-center border-b pb-3 last:border-b-0">
              <img
                src={item.product?.image?.[0]}
                alt={item.product?.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">{item.product?.name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: <span className="font-medium">{item.quantity}</span>
                </p>
                <p className="text-sm font-bold text-green-600">
                  {currency} {((item.product?.offerPrice || item.product?.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Total */}
        <div className="mt-6 border-t pt-4 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-sm text-gray-600">
            Payment Type: <span className="font-semibold text-gray-900">{order.paymentType}</span>
          </p>
          <p className="text-sm font-bold">
            Total Amount: <span className="text-lg text-gray-900">{currency} {order.amount}</span>
          </p>
        </div>

        {/* Delivery Boy Info - if assigned */}
        {order.assignedDeliveryBoy && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm font-semibold">🚴 Delivery Boy: {order.assignedDeliveryBoy.name}</p>
            <p className="text-sm text-gray-600">📞 {order.assignedDeliveryBoy.phone}</p>
          </div>
        )}
      </div>

      {/* Chat Button */}
      <button
        onClick={navigateToChatRequest}
        className="fixed bottom-6 right-6 px-7 py-4 rounded-full bg-linear-to-r from-green-500 to-emerald-600 text-white text-2xl shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
      >
        💬 <span className="font-semibold text-sm">Chat</span>
      </button>
    </div>
  );
};

export default DeliveryTracking;