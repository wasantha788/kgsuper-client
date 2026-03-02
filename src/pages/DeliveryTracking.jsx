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

  // Fetch order with Auth handling
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
      // ✅ Handle "jwt expired" / 401 Unauthorized
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
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
        <p className="text-gray-500 dark:text-gray-400 text-lg animate-pulse">Loading order details...</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 flex flex-col items-center transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Track Order</h1>

      {/* QR Code Section */}
      <div className="mb-4 p-4 bg-white rounded-xl shadow-sm dark:bg-gray-200">
        <QRCode value={order._id} size={128} />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{order._id}</span>
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-8 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-700 ease-in-out ${
            order.status === "Cancelled" ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${statusProgress[order.status] || 0}%` }}
        />
      </div>

      {/* Status Steps */}
      <div className="w-full max-w-3xl flex justify-between text-[10px] md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-8">
        {steps.map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center text-white transition-colors ${
                steps.indexOf(order.status) >= steps.indexOf(step)
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              {steps.indexOf(order.status) >= steps.indexOf(step) ? "✓" : ""}
            </div>
            <span className={steps.indexOf(order.status) >= steps.indexOf(step) ? "text-green-600 dark:text-green-400 font-bold" : ""}>
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Order Items Card */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
          <p className="text-sm font-bold dark:text-gray-200">
            Total Amount: <span className="text-lg text-gray-900 dark:text-white ml-1">{currency}{order.amount}</span>
          </p>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={navigateToChatRequest}
        className="fixed bottom-6 right-6 px-6 py-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl flex items-center gap-2 hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span className="text-2xl">💬</span>
        <span className="font-bold text-sm">Chat with Support</span>
      </button>
    </div>
  );
};

export default DeliveryTracking;