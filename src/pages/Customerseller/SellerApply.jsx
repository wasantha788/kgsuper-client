import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  Package, X, User, Mail, Plus, Image as ImageIcon,
  ChevronLeft, Home, RefreshCcw, CheckCircle2, XCircle, Trash2
} from "lucide-react";

export default function MarketplaceManager() {
  const [viewMode, setViewMode] = useState("seller"); // "seller" or "admin"
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-green-50 py-12 px-4">
      <Toaster position="top-right" />
      
      {/* Navigation */}
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
        {viewMode === "admin" ? (
          <AdminRequestTable />
        ) : (
          <div className="space-y-12">
            <SellerAddProduct />
            <hr className="border-emerald-200" />
            <SellerProducts />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= SELLER PRODUCTS TABLE (NEW) ================= */
function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged in seller info
  const seller = JSON.parse(localStorage.getItem("seller"));
  const sellerEmail = seller?.email;

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("https://kgsuper-server-production.up.railway.app/api/sellerRequest");
      if (data?.success) {
        // Filter products so seller only sees their own
        const myProducts = data.products.filter(p => p.sellerEmail === sellerEmail);
        setProducts(myProducts);
      }
    } catch (err) {
      toast.error("Failed to load your products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerEmail) fetchProducts();
  }, [sellerEmail]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`https://kgsuper-server-production.up.railway.app/api/sellerRequest/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Product removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Submitted <span className="text-emerald-600">Inventory</span></h2>
        <button onClick={fetchProducts} className="p-2 hover:bg-emerald-50 rounded-full text-emerald-600 transition-colors">
            <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-4">Product</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="py-10 text-center text-slate-400 font-bold">Loading your products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="4" className="py-10 text-center text-slate-400">No products found for this account.</td></tr>
            ) : products.map((p) => (
              <tr key={p._id} className="hover:bg-emerald-50/20 transition-colors">
                <td className="px-8 py-4 flex items-center gap-4">
                  <img src={p.images?.[0]?.url} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt=""/>
                  <div>
                    <p className="font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">{p.category}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-black text-slate-700">Rs. {p.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    p.status === 'approved' ? 'bg-green-100 text-green-600' : 
                    p.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {p.status || 'pending'}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <button onClick={() => handleDelete(p._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= ADMIN REQUEST TABLE ================= */
function AdminRequestTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("https://kgsuper-server-production.up.railway.app/api/sellerRequest");
      if (data?.success) setRequests(data.products || []);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filteredRequests = requests.filter(req => req.status === activeTab);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await axios.delete(`https://kgsuper-server-production.up.railway.app/api/sellerRequest/${id}`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Product <span className="text-emerald-600">Requests</span></h1>
          <p className="text-slate-500 font-medium mt-1">Review and manage incoming seller submissions.</p>
        </div>

        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-100">
          {["pending","approved","rejected"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab===tab?"bg-white text-emerald-700 shadow-md":"text-slate-400 hover:text-emerald-600"}`}
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
                <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-bold">Loading...</td></tr>
              ) : filteredRequests.length===0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-bold">No {activeTab} requests</td></tr>
              ) : filteredRequests.map(req => (
                <tr key={req._id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-8 py-6 flex items-center gap-4">
                    <img src={req.images?.[0]?.url} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-inner"/>
                    <div>
                      <p className="font-black text-slate-800 leading-tight">{req.name}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">{req.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5"><User className="w-3 h-3"/> {req.sellerName}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3"/> {req.sellerEmail}</div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="font-black text-slate-800">Rs. {req.price}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Qty: {req.quantity}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => handleDelete(req._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= SELLER ADD PRODUCT ================= */
function SellerAddProduct() {
  const [form, setForm] = useState({
    name:"", description:"", category:"", price:"", weight:"", quantity:"",
    sellerName:"", sellerEmail:"", sellerPhone:"", sellerAddress:""
  });
  const [images, setImages] = useState([null,null,null,null]);
  const [loading, setLoading] = useState(false);

  // AUTO-FILL FROM LOCALSTORAGE
  useEffect(() => {
    const savedSeller = JSON.parse(localStorage.getItem("seller"));
    if (savedSeller) {
      setForm(prev => ({
        ...prev,
        sellerName: savedSeller.name || "",
        sellerEmail: savedSeller.email || "",
        sellerPhone: savedSeller.phone || "",
        sellerAddress: savedSeller.address || "",
      }));
    }
  }, []);

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});
  const handleImageChange = (i, file) => {
    const newImages = [...images];
    newImages[i] = file;
    setImages(newImages);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const selected = images.filter(i => i);
    if (selected.length === 0) {
      toast.error("Upload at least one image");
      setLoading(false);
      return;
    }

    const fd = new FormData();
    selected.forEach(img => fd.append("images", img));
    Object.keys(form).forEach(k => fd.append(k, form[k]));

    try {
      await axios.post("https://kgsuper-server-production.up.railway.app/api/sellerRequest/products", fd);
      toast.success("Product Sent for Approval!");
      // Reset non-seller fields only
      setForm(prev => ({
        ...prev,
        name: "", description: "", category: "", price: "", weight: "", quantity: ""
      }));
      setImages([null,null,null,null]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Image and Inventory Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-emerald-100">
          <h2 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-xs uppercase tracking-widest">
            <ImageIcon className="w-4 h-4 text-emerald-500"/> Product Images
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="aspect-square relative group">
                {img ? (
                  <div className="w-full h-full rounded-2xl overflow-hidden border border-emerald-100">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover"/>
                    <button type="button" onClick={() => handleImageChange(idx, null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3"/>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-colors">
                    <Plus className="w-5 h-5 text-emerald-300"/>
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageChange(idx, e.target.files[0])}/>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
          <Package className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10"/>
          <h3 className="font-black text-xs uppercase tracking-widest text-emerald-400 mb-6">Inventory</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-emerald-200">Qty</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mt-1 outline-none font-black text-lg"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-emerald-200">Weight</label>
              <input type="text" name="weight" value={form.weight} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mt-1 outline-none font-black text-lg"/>
            </div>
          </div>
        </div>
      </div>

      {/* Details and Seller Info Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Product Title</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold"/>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Category</label>
              <input type="text" name="category" value={form.category} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold"/>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Price (Rs.)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none"/>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-emerald-100">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <User className="w-4 h-4"/> Seller Information (Verify)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="sellerName" placeholder="Name" value={form.sellerName} onChange={handleChange} required className="px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"/>
            <input type="email" name="sellerEmail" placeholder="Email" value={form.sellerEmail} onChange={handleChange} required readOnly className="px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 font-bold text-slate-500 cursor-not-allowed"/>
            <input type="tel" name="sellerPhone" placeholder="Phone" value={form.sellerPhone} onChange={handleChange} required className="px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"/>
            <input type="text" name="sellerAddress" placeholder="Address" value={form.sellerAddress} onChange={handleChange} required className="md:col-span-2 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"/>
          </div>
          
          <button disabled={loading} type="submit" className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
            {loading ? <RefreshCcw className="w-6 h-6 animate-spin"/> : <CheckCircle2 className="w-6 h-6"/>}
            {loading ? "PROCESSING..." : "SUBMIT PRODUCT"}
          </button>
        </div>
      </div>
    </form>
  );
}