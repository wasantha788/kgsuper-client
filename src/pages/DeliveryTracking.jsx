import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currency, getUserHeaders } = useAppContext();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Ref to track interval so we can kill it immediately on 401 error
  const pollingRef = useRef(null);

  /**
   * Fetch Order Details
   */
  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/order/${orderId}`, {
        headers: getUserHeaders(),
        withCredentials: true,
      });

      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error(data.message || "Failed to fetch order");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // 🛑 Stop polling immediately if unauthorized
        if (pollingRef.current) clearInterval(pollingRef.current);
        
        console.warn("Auth token expired. Redirecting...");
        toast.error("Session expired. Please login again.");
        navigate("/login"); 
      } else {
        toast.error(error.response?.data?.message || "Error fetching order");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lifecycle for Auto-refresh
   */
  useEffect(() => {
    if (!orderId) return;

    // 🛡️ Pre-emptive Auth Guard
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrder();
    
    // Refresh every 10 seconds to catch status updates
    pollingRef.current = setInterval(fetchOrder, 10000);
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId]);

  const navigateToChatRequest = () => {
    if (!order) return;
    navigate(`/delivery/chat-request/${order._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 text-lg animate-pulse">
          Loading order details...
        </p>
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

      {/* QR Code Wrapper (White background is essential for scanning) */}
      <div className="mb-4 p-4 bg-white rounded-2xl shadow-lg border dark:border-gray-700">
        <QRCode value={order._id} size={140} />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{order._id}</span>
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-8">
        <div
          className={`h-4 rounded-full transition-all duration-700 ease-in-out ${
            order.status === "Cancelled" ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${statusProgress[order.status] || 0}%` }}
        />
      </div>

      {/* Status Steps Flow */}
      <div className="w-full max-w-3xl flex justify-between text-[10px] md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-12">
        {steps.map((step) => {
          const isCompleted = steps.indexOf(order.status) >= steps.indexOf(step);
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center text-white transition-colors duration-500 ${
                  isCompleted ? "bg-green-500 shadow-md shadow-green-200 dark:shadow-none" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                {isCompleted ? "✓" : ""}
              </div>
              <span className={`text-center ${isCompleted ? "text-green-600 dark:text-green-400 font-bold" : ""}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Order Summary Card */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-700">
        <h2 className="text-lg font-bold mb-6 dark:text-white border-b dark:border-gray-700 pb-2">Items Summary</h2>
        <div className="space-y-6">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 items-center border-b dark:border-gray-700 pb-4 last:border-b-0">
              <img
                src={item.product?.image?.[0]}
                alt={item.product?.name}
                className="w-20 h-20 rounded-xl object-cover border dark:border-gray-600"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{item.product?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quantity: <span className="font-medium">{item.quantity}</span>
                </p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                  {currency}{((item.product?.offerPrice || item.product?.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 border-t dark:border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</p>
            <p className="font-bold text-gray-900 dark:text-white">{order.paymentType}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {currency}{order.amount}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Chat Support Action */}
      <button
        onClick={navigateToChatRequest}
        className="fixed bottom-8 right-8 px-8 py-4 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl flex items-center gap-3 hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform">💬</span>
        <span className="font-bold">Contact Support</span>
      </button>
    </div>
  );
};

export default DeliveryTracking;