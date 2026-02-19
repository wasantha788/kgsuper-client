import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  Package, X, User, Mail, Plus, Image as ImageIcon,
  ChevronLeft, Home, RefreshCcw, CheckCircle2, XCircle
} from "lucide-react";

export default function MarketplaceManager() {
  const [viewMode, setViewMode] = useState("seller"); // "seller" or "admin"
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-green-50 py-12 px-4">
      <Toaster position="top-right" />
      
      {/* Universal Navigation */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-100 rounded-full text-emerald-700 font-bold text-sm shadow-sm hover:bg-emerald-600 hover:text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* Admin/Seller Switcher */}
        <div className="bg-white p-1 rounded-full shadow-inner border border-emerald-100 flex">
          <button 
            onClick={() => setViewMode("seller")}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase transition-all ${viewMode === 'seller' ? 'bg-emerald-600 text-white' : 'text-emerald-600'}`}
          >
            Seller Portal
          </button>
          <button 
            onClick={() => setViewMode("admin")}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase transition-all ${viewMode === 'admin' ? 'bg-emerald-600 text-white' : 'text-emerald-600'}`}
          >
            Admin Panel
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {viewMode === "admin" ? <AdminRequestTable /> : <SellerAddProduct />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ADMIN VIEW: REQUEST TABLE WITH TABS                                        */
/* -------------------------------------------------------------------------- */
function AdminRequestTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // FIX: Matches router.get("/") in your backend
      const { data } = await axios.get("https://kgsuper-server-production.up.railway.app/api/sellerRequest");
      
      // Safety check for backend response structure { success: true, products: [] }
      if (data && data.success) {
        setRequests(data.products || []);
      } else if (Array.isArray(data)) {
        setRequests(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load requests from server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchRequests(); 
  }, [fetchRequests]);

  const handleStatusUpdate = async (id, status) => {
    try {
      // FIX: Matches router.patch("/update-status/:id") in your backend
      const response = await axios.patch(`https://kgsuper-server-production.up.railway.app/api/sellerRequest/update-status/${id}`, { status });
      
      if (response.data.success) {
        toast.success(`Product ${status} successfully!`);
        fetchRequests(); // Refresh list
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Update failed. Check backend console.");
    }
  };

  const filteredRequests = requests.filter(req => req.status === activeTab);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Product <span className="text-emerald-600">Requests</span></h1>
          <p className="text-slate-500 font-medium mt-1">Review and manage incoming seller submissions.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-100">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-white text-emerald-700 shadow-md" : "text-slate-400 hover:text-emerald-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-5">Product Info</th>
                <th className="px-6 py-5">Seller Details</th>
                <th className="px-6 py-5">Inventory/Price</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-bold">Loading requests...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">No {activeTab} requests found</td></tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                          <img 
                            // FIX: Correctly formats paths for browser display
                            src={`http://localhost:4000/${req.images[0]?.replace(/\\/g, '/')}`} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=No+Image" }}
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 leading-tight">{req.name}</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">{req.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><User className="w-3 h-3"/> {req.sellerName}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3"/> {req.sellerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-black text-slate-800">Rs. {req.price}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Qty: {req.quantity} • {req.weight}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {activeTab !== "approved" && (
                          <button 
                            onClick={() => handleStatusUpdate(req._id, "approved")}
                            className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        {activeTab !== "rejected" && (
                          <button 
                            onClick={() => handleStatusUpdate(req._id, "rejected")}
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SELLER VIEW: PRODUCT ADD FORM                                              */
/* -------------------------------------------------------------------------- */
function SellerAddProduct() {
  const [form, setForm] = useState({
    name: "", description: "", category: "", price: "",
    weight: "", quantity: "", sellerName: "", sellerEmail: "", sellerPhone: "", sellerAddress: ""
  });
  const [images, setImages] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const selectedImages = images.filter(img => img !== null);
    if (selectedImages.length === 0) {
      setLoading(false);
      return toast.error("Please upload at least one image");
    }

    const formData = new FormData();
    selectedImages.forEach(img => formData.append("images", img));
    Object.keys(form).forEach(key => formData.append(key, form[key]));

    try {
      // Matches router.post("/products")
      await axios.post("http://localhost:4000/api/sellerRequest/products", formData);
      toast.success("Submission Sent for Approval!");
      
      // Reset form
      setForm({ name: "", description: "", category: "", price: "", weight: "", quantity: "", sellerName: "", sellerEmail: "", sellerPhone: "", sellerAddress: "" });
      setImages([null, null, null, null]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Column: Media & Inventory */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-emerald-100">
          <h2 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-xs uppercase tracking-widest">
            <ImageIcon className="w-4 h-4 text-emerald-500" /> Image Gallery
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="aspect-square relative group">
                {img ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-emerald-100">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleImageChange(idx, null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-colors">
                    <Plus className="w-5 h-5 text-emerald-300" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(idx, e.target.files[0])} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
          <Package className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
          <h3 className="font-black text-xs uppercase tracking-widest text-emerald-400 mb-6">Inventory Detail</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-emerald-200">Total Quantity</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mt-1 outline-none focus:bg-white/20 font-black text-lg"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-emerald-200">Weight (e.g. 500g, 1kg)</label>
              <input type="text" name="weight" value={form.weight} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mt-1 outline-none focus:bg-white/20 font-black text-lg"/>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form Fields */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Product Title</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"/>
            </div>
                 <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Category
              </label>

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Enter category"
                required
                className="w-full px-5 py-4 rounded-2xl 
               bg-slate-50 border border-slate-200 
               outline-none font-bold 
               focus:border-emerald-500 
               focus:ring-2 focus:ring-emerald-100
               transition-all duration-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Price (Rs.)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-medium"/>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-emerald-100">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><User className="w-4 h-4" /> Seller Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="sellerName" placeholder="Full Name" value={form.sellerName} onChange={handleChange} required className="px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"/>
            <input type="email" name="sellerEmail" placeholder="Email Address" value={form.sellerEmail} onChange={handleChange} required className="px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"/>
            <input type="tel" name="sellerPhone" placeholder="Phone Number" value={form.sellerPhone} onChange={handleChange} required className="px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"/>
            <input type="text" name="sellerAddress" placeholder="Pickup Address" value={form.sellerAddress} onChange={handleChange} required className="md:col-span-2 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"/>
          </div>
          
          <button 
            disabled={loading}
            type="submit" 
            className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-emerald-200"
          >
            {loading ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            {loading ? "SUBMITTING..." : "SUBMIT FOR APPROVAL"}
          </button>
        </div>
      </div>
    </form>
  );
}
