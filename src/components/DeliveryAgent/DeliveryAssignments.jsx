import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Truck,
  Package as PackageIcon,
  MapPin,
  UserPlus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import axios from "axios";

const orderSteps = [
  { id: 1, label: "Order Placed", icon: <PackageIcon /> },
  { id: 2, label: "Packed", icon: <PackageIcon /> },
  { id: 3, label: "Shipped", icon: <Truck /> },
  { id: 4, label: "Out for Delivery", icon: <MapPin /> },
  { id: 5, label: "Delivered", icon: <CheckCircle /> },
];

export default function OrderTracking() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [editingId, setEditingId] = useState(null);
  const [currentStep, setCurrentStep] = useState(3);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch delivery boys from backend
  useEffect(() => {
    const fetchDeliveryBoys = async () => {
      try {
        setFetching(true);
        const response = await axios.get("/api/deliveryagents");
        setDeliveryBoys(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch delivery boys");
      } finally {
        setFetching(false);
      }
    };
    fetchDeliveryBoys();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add or update delivery boy
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update existing delivery boy
        const response = await axios.put(`/api/deliveryagents/${editingId}`, form);
        setDeliveryBoys((prev) =>
          prev.map((boy) => (boy._id === editingId ? response.data : boy))
        );
        toast.success("Delivery boy updated successfully!");
        setEditingId(null);
      } else {
        // Add new delivery boy
        const response = await axios.post("/api/deliveryagents", form);
        setDeliveryBoys((prev) => [...prev, response.data]);
        toast.success("Delivery boy added successfully!");
      }

      setForm({ name: "", phone: "", address: "" });
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit button click
  const handleEdit = (boy) => {
    setForm({ name: boy.name, phone: boy.phone, address: boy.address });
    setEditingId(boy._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete button click
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery boy?")) return;

    try {
      await axios.delete(`/api/deliveryagents/${id}`);
      setDeliveryBoys((prev) => prev.filter((boy) => boy._id !== id));
      toast.success("Delivery boy deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete delivery boy");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-3xl font-black text-center text-emerald-700 mb-8">
        Seller Dashboard - Delivery Tracking
      </h1>

      {/* Add / Edit Delivery Boy Form */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-lg mb-10">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-emerald-600" />{" "}
          {editingId ? "Edit Delivery Boy" : "Add Delivery Boy"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
          />
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-2 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Delivery Boy" : "Add Delivery Boy"}
          </button>
        </form>
      </div>

      {/* Realtime Order Tracking */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-lg mb-10">
        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-600" /> Current Order Tracking
        </h2>
        <div className="space-y-4">
          {orderSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                step.id <= currentStep
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "bg-gray-50 border-gray-300 text-gray-400"
              }`}
            >
              <div className="text-xl">{step.icon}</div>
              <div className="flex-1 font-medium">{step.label}</div>
              {step.id <= currentStep && <CheckCircle className="text-green-600" />}
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          {currentStep === 5 ? (
            <p className="text-green-600 font-semibold">
              ✅ Your product has been delivered!
            </p>
          ) : (
            <p className="text-blue-600">
              🚚 Current Status: <strong>{orderSteps[currentStep - 1].label}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Delivery Boys Table */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-lg mb-10">
        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
          Delivery Boys List
        </h2>

        {fetching ? (
          <p className="text-center text-gray-500">Loading delivery boys...</p>
        ) : deliveryBoys.length === 0 ? (
          <p className="text-center text-gray-500">No delivery boys found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border-b">Name</th>
                <th className="p-3 border-b">Phone</th>
                <th className="p-3 border-b">Address</th>
                <th className="p-3 border-b">Orders Completed</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveryBoys.map((boy) => (
                <tr key={boy._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{boy.name}</td>
                  <td className="p-3 border-b">{boy.phone}</td>
                  <td className="p-3 border-b">{boy.address}</td>
                  <td className="p-3 border-b">{boy.ordersCompleted}</td>
                  <td className="p-3 border-b flex gap-2">
                    <button
                      onClick={() => handleEdit(boy)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(boy._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delivery Boys Order Completion Bar Chart */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
          Delivery Boys Order Completion
        </h2>

        {fetching ? (
          <p className="text-center text-gray-500">Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={deliveryBoys}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ordersCompleted" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
