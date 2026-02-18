import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const MyOrders = () => {
  const { user, currency, isAdmin } = useAppContext();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Fetch orders from the backend
  const fetchOrders = async () => {
    try {
      if (!user?._id) return;
      const url = isAdmin ? "/api/order" : "/api/order/user";
      const { data } = await axios.get(url, { withCredentials: true });
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching orders");
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  // Cancel order logic (only for 'Order Placed' status)
  const cancelOrder = async (orderId) => {
    try {
      const { data } = await axios.put(
        `/api/order/cancel/${orderId}`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  // Helper for Payment Status text
  const getPaymentStatus = (isPaid) =>
    isPaid ? (
      <span className="text-green-600 font-bold">Paid</span>
    ) : (
      <span className="text-orange-600 font-bold">Pending</span>
    );

  // Helper for Order Status Badge (The message from the Admin dropdown)
  const getStatusBadge = (status) => {
    const styles = {
      "Order Placed": "bg-gray-100 text-gray-600",
      "Packing": "bg-blue-100 text-blue-600",
      "Shipped": "bg-purple-100 text-purple-600",
      "Out for delivery": "bg-orange-100 text-orange-600",
      "Delivered": "bg-green-100 text-green-600",
      "Cancelled": "bg-red-100 text-red-600",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  if (!orders || orders.length === 0)
    return (
      <div className="flex justify-center items-center h-[70vh] px-4">
        <p className="text-gray-500 text-lg text-center">You have no orders yet.</p>
      </div>
    );

  return (
    <div className="mt-16 pb-20 flex flex-col items-center w-full bg-gray-50 min-h-screen">
      <div className="text-center mb-8 px-4">
        <p className="text-3xl font-bold text-gray-800 uppercase tracking-tight">My Orders</p>
        <div className="w-16 h-1.5 bg-green-500 mx-auto mt-2 rounded-full"></div>
      </div>

      <div className="w-full lg:max-w-5xl px-4 space-y-6">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Header: ID & Meta */}
            <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                <p className="text-sm font-mono text-gray-700">{order._id}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {getStatusBadge(order.status)}
                <div className="text-sm border-l pl-3 border-gray-200">
                  <p className="text-gray-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Items List */}
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row justify-between gap-4 last:border-none">
                  <div className="flex gap-4">
                    <img
                      src={item.product?.image?.[0]}
                      alt={item.product?.name}
                      className="w-20 h-20 rounded-xl border object-cover bg-gray-50"
                    />
                    <div>
                      <h2 className="font-bold text-gray-900">{item.product?.name}</h2>
                      <p className="text-sm text-gray-500">Quantity: <span className="text-gray-800 font-medium">{item.quantity}</span></p>
                      <p className="text-sm font-bold text-green-600 mt-1">
                        {currency} {((item.product?.offerPrice || item.product?.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: Details & Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Payment:</span> {order.paymentType} ({getPaymentStatus(order.isPaid)})
                </p>
                <p className="text-sm text-gray-600 font-bold">
                  Total Amount: <span className="text-lg text-gray-900">{currency}{order.amount}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {!isAdmin && order.status === "Order Placed" && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="flex-1 md:flex-none px-6 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
                
                <button
                  onClick={() => navigate(`/delivery-tracking/${order._id}`)}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl text-sm font-bold transition-transform active:scale-95 shadow-lg shadow-gray-200"
                >
                  Track Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;