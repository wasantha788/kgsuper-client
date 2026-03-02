import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currency } = useAppContext();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch order with 401 handling to "remove" token errors
  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/order/${orderId}`, {
        withCredentials: true,
      });

      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error(data.message || "Failed to fetch order");
      }
    } catch (error) {
      // ✅ Check if the error is 401 (Unauthorized/Expired Token)
      if (error.response?.status === 401) {
        console.warn("Auth token expired. Redirecting...");
        // Use toast.error only once to avoid spamming during intervals
        if (!loading) toast.error("Session expired. Please login again.");
        navigate("/login"); 
      } else {
        toast.error(error.response?.data?.message || "Error fetching order");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh logic
  useEffect(() => {
    if (!orderId) return;

    fetchOrder();
    
    // Refresh every 10 seconds. 
    // If the token expires, the fetchOrder catch block will redirect the user.
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const navigateToChatRequest = () => {
    if (!order) return;
    navigate(`/delivery/chat-request/${order._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Order not found.</p>
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

  const steps = ["Order Placed", "Processing", "Packing", "Out for delivery", "Delivered"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 flex flex-col items-center transition-colors">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Track Order</h1>

      {/* QR Code with white bg for scannability in dark mode */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
        <QRCode value={order._id} size={128} />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{order._id}</span>
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-8">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${
            order.status === "Cancelled" ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${statusProgress[order.status] || 0}%` }}
        />
      </div>

      {/* Status Steps */}
      <div className="w-full max-w-3xl flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-8">
        {steps.map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center text-white ${
                steps.indexOf(order.status) >= steps.indexOf(step)
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              {steps.indexOf(order.status) >= steps.indexOf(step) ? "✓" : ""}
            </div>
            <span className="text-center text-[10px] md:text-xs">{step}</span>
          </div>
        ))}
      </div>

      {/* Order Items */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-700">
        <h2 className="text-lg font-bold mb-4 dark:text-white">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 items-center border-b dark:border-gray-700 pb-3 last:border-b-0">
              <img
                src={item.product?.image?.[0]}
                alt={item.product?.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold dark:text-gray-100">{item.product?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quantity: <span className="font-medium">{item.quantity}</span>
                </p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {currency}{( (item.product?.offerPrice || item.product?.price) * item.quantity ).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Total */}
        <div className="mt-6 border-t dark:border-gray-700 pt-4 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Payment Type: <span className="font-semibold text-gray-900 dark:text-gray-100">{order.paymentType}</span>
          </p>
          <p className="text-sm font-bold dark:text-gray-100">
            Total Amount: <span className="text-lg text-gray-900 dark:text-white">{currency}{order.amount}</span>
          </p>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={navigateToChatRequest}
        className="fixed bottom-6 right-6 px-7 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
      >
        💬 <span className="font-semibold text-sm">Chat</span>
      </button>
    </div>
  );
};

export default DeliveryTracking;