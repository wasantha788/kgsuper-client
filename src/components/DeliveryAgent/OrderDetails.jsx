import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";

const STATUS_OPTIONS = [
  "Order Placed",
  "Processing",
  "Packing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

const DeliveryOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/delivery/${id}`
        );
        if (res.data?.order) {
          setOrder(res.data.order);
        } else {
          toast.error("Order not found");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const updateStatus = async (status) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await axios.put(
        `http://localhost:4000/api/delivery/status/${order._id}`,
        { status }
      );
      if (res.data?.order) setOrder(res.data.order);
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return <p className="text-center mt-20">Loading order...</p>;
  if (!order)
    return <p className="text-center mt-20 text-red-500">Order not found</p>;

  // Access the actual order details
  const details = order.orderDetails || {};
  const address = details.address || {};
  const items = details.items || [];
  const deliveryBoy = order.deliveryBoy || {}; // <-- populated delivery boy

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Link
        to="/delivery-dashboard"
        className="flex items-center gap-2 text-blue-600 font-semibold"
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold">
        Order #{order._id.slice(-6).toUpperCase()}
      </h1>

      {/* Status */}
      <div className="bg-white p-4 rounded-xl shadow border flex items-center gap-3">
        <strong>Status:</strong>
        <select
          value={order.status}
          disabled={updating}
          onChange={(e) => updateStatus(e.target.value)}
          className="border px-3 py-1 rounded-md"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {updating && <span className="text-sm text-blue-600">Updating...</span>}
      </div>

      {/* Delivery Boy */}
      {deliveryBoy._id && (
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="font-bold text-lg mb-2">Delivery Boy Details</h2>
          <p>
            <strong>Name:</strong> {deliveryBoy.name}
          </p>
          <p>
            <strong>Email:</strong> {deliveryBoy.email}
          </p>
          <p>
            <strong>Phone:</strong> {deliveryBoy.phone}
          </p>
        </div>
      )}

      {/* Customer */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="font-bold text-lg mb-2">Customer Details</h2>
        <p>
          <strong>Name:</strong> {address.firstName} {address.lastName}
        </p>
        <p>
          <strong>Email:</strong> {address.email}
        </p>
        <p>
          <strong>Phone:</strong> {address.phone}
        </p>
        <p>
          <strong>Address:</strong> {address.street}, {address.city}, {address.state},{" "}
          {address.zipcode}, {address.country}
        </p>
      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="font-bold text-lg mb-4">Order Items</h2>
        {items.map((item) => (
          <div key={item._id} className="flex gap-4 border p-4 rounded-lg">
            <img
              src={item.product?.image?.[0]}
              alt={item.product?.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <p className="font-bold">{item.product?.name}</p>
              <p className="text-sm text-gray-500">{item.product?.category}</p>
              <p>Qty: {item.quantity}</p>
              <p>
                Price: <s>${item.product?.price}</s>{" "}
                <strong>${item.product?.offerPrice}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <p>
          <strong>Payment:</strong> {details.paymentType}
        </p>
        <p>
          <strong>Paid:</strong> {details.isPaid ? "Yes" : "No"}
        </p>
        <p>
          <strong>Order Created:</strong> {formatDate(details.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default DeliveryOrderDetails;
