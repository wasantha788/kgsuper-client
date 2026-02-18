import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { io } from "socket.io-client";

const DeliveryOrders = () => {
  const { axios, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io("http://localhost:4000", { transports: ["websocket"] });
    socket.emit("registerDeliveryBoy", user._id);

    // Fetch initial orders
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/order/deliveryBoy", {
    
        });
        if (data.success) setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // ---------------- SOCKET LISTENERS ----------------
    socket.on("myOrders", (orders) => setOrders(orders));
    socket.on("newDeliveryOrder", (order) => setOrders(prev => [...prev, order]));
    socket.on("orderUpdated", (order) => setOrders(prev => prev.map(o => o._id === order._id ? order : o)));
    socket.on("orderRemoved", (orderId) => setOrders(prev => prev.filter(o => o._id !== orderId)));

    return () => socket.disconnect();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (!orders.length) return <p>No assigned orders yet.</p>;

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.map(order => (
        <div key={order._id} className="p-4 border mb-4 rounded">
          <p>Order ID: {order._id}</p>
          <p>Status: {order.status}</p>
          <p>Amount: {order.amount}</p>
          <p>Customer: {order.address?.firstName} {order.address?.lastName}</p>
        </div>
      ))}
    </div>
  );
};

export default DeliveryOrders;
