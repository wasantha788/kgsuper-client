import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

const DeliveryDashboard = () => {
  const { user } = useAppContext(); // logged-in delivery boy
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/deliveryBoy/orders/${user._id}`);
        const data = await res.json();

        if (data.success && data.deliveryBoy?.activeOrders) {
          setOrders(data.deliveryBoy.activeOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="delivery-dashboard">
      <h2>Delivery Boy Orders</h2>

      {orders.length === 0 ? (
        <p>No orders assigned yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            {/* DELIVERY BOY INFO */}
            <h3>Delivery Boy</h3>
            <p>Name: {order.deliveryBoy?.name ?? "N/A"}</p>
            <p>Email: {order.deliveryBoy?.email ?? "N/A"}</p>
            <p>Phone: {order.deliveryBoy?.phone ?? "N/A"}</p>
            <p>Status: {order.deliveryBoy?.isAvailable ? "Available" : "Busy"}</p>

            <hr />

            {/* ORDER INFO */}
            <h3>Order Details</h3>
            <p>Status: {order.status}</p>
            <p>
              Accepted At:{" "}
              {order.acceptedAt
                ? new Date(order.acceptedAt).toLocaleString()
                : "N/A"}
            </p>
            <p>Total: Rs.{order.orderDetails?.amount ?? "N/A"}</p>
            <p>Payment: {order.orderDetails?.paymentType ?? "N/A"}</p>

            {/* CUSTOMER ADDRESS */}
            <h4>Customer</h4>
            <p>
              {order.orderDetails?.address?.firstName ?? ""}{" "}
              {order.orderDetails?.address?.lastName ?? ""}
            </p>
            <p>{order.orderDetails?.address?.street ?? ""}</p>
            <p>{order.orderDetails?.address?.city ?? ""}</p>

            {/* ITEMS */}
            {order.orderDetails?.items?.length > 0 && (
              <>
                <h4>Items</h4>
                <ul>
                  {order.orderDetails.items.map((item) => (
                    <li key={item._id}>
                      {item.product?.name ?? "Product"} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DeliveryDashboard;
