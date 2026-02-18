import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, MapPin, RefreshCcw, X, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function SellerRequest() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const API_URL = "http://localhost:4000";

  // --- Fetch all seller requests ---
  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/sellerRequest`);
      if (data.success) {
        const normalized = (data.products || []).map((p) => ({
          ...p,
          _id: typeof p._id === "object" ? p._id.$oid : p._id,
        }));
        setProducts(normalized);
        setFilteredProducts(normalized);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // --- Filter products by search term ---
  useEffect(() => {
    const results = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sellerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  // --- Delete a product ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/api/sellerRequest/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setFilteredProducts((prev) => prev.filter((p) => p._id !== id));
      if (selectedProduct?._id === id) setSelectedProduct(null);
      toast.success("Deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    }
  };

  // --- Update product status & notify email sent ---
  const handleChangeStatus = async (id, status) => {
    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status)) {
      toast.error("Invalid status");
      return;
    }

    try {
      const { data } = await axios.patch(`${API_URL}/api/sellerRequest/update-status/${id}`, { status });

      if (data.success) {
        setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
        setFilteredProducts((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
        if (selectedProduct?._id === id) setSelectedProduct({ ...selectedProduct, status });

        toast.success(`Status changed to ${status} & email sent to seller`);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status or send email");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">Fetching all requests...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] relative">
      <Toaster position="top-right" />

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:text-red-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col lg:flex-row gap-4 p-4">
              {/* Images */}
              <div className="lg:w-1/2 flex flex-col gap-2">
                {selectedProduct.images?.length
                  ? selectedProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={`${API_URL}/${img.replace(/\\/g, "/")}`}
                        alt={`${selectedProduct.name} ${i + 1}`}
                        className="w-full h-64 object-cover rounded-xl cursor-pointer"
                        onClick={() => setSelectedImage(`${API_URL}/${img.replace(/\\/g, "/")}`)}
                      />
                    ))
                  : (
                    <img
                      src="https://via.placeholder.com/600x400"
                      alt="placeholder"
                      className="w-full h-64 object-cover rounded-xl cursor-pointer"
                      onClick={() => setSelectedImage("https://via.placeholder.com/600x400")}
                    />
                  )}
              </div>

              {/* Details */}
              <div className="lg:w-1/2 p-6 flex flex-col gap-4">
                <h2 className="text-3xl font-black text-gray-900 capitalize">{selectedProduct.name}</h2>
                <p className="text-2xl font-bold text-emerald-600">LKR {selectedProduct.price.toLocaleString()}</p>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl italic">{selectedProduct.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-xl">
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="font-bold">{selectedProduct.category}</p>
                  </div>
                  <div className="p-3 border rounded-xl">
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="font-bold">{selectedProduct.quantity}</p>
                  </div>
                  <div className="p-3 border rounded-xl">
                    <p className="text-xs text-gray-400">Weight</p>
                    <p className="font-bold">{selectedProduct.weight}</p>
                  </div>
                  <div className="p-3 border rounded-xl">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="font-bold capitalize">{selectedProduct.status}</p>
                    {selectedProduct.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleChangeStatus(selectedProduct._id, "approved")}
                          className="flex-1 bg-emerald-600 text-white py-1 rounded-xl hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleChangeStatus(selectedProduct._id, "rejected")}
                          className="flex-1 bg-red-600 text-white py-1 rounded-xl hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border rounded-xl col-span-2">
                    <p className="text-xs text-gray-400">Seller Name</p>
                    <p className="font-bold">{selectedProduct.sellerName}</p>
                    
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-bold">{selectedProduct.sellerEmail || "N/A"}</p>

                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="font-bold">{selectedProduct.sellerPhone}</p>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="font-bold">{selectedProduct.sellerAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE POPUP */}
      {selectedImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:text-red-600"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="Selected" className="w-full max-h-[90vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* HEADER & SEARCH */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-6 md:px-12">
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Master Request List</h1>
            <p className="text-sm text-gray-500 font-medium">Viewing {filteredProducts.length} items</p>
          </div>
          <button onClick={fetchAllRequests} className="p-2 hover:bg-gray-100 rounded-full">
            <RefreshCcw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product, seller name or email..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="p-4 md:p-12 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed col-span-full">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No results matching your search.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              {/* Product Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={product.images?.[0] ? `${API_URL}/${product.images[0].replace(/\\/g, "/")}` : "https://via.placeholder.com/400x300"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-emerald-600">
                  {product.category}
                </div>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-black text-gray-800 text-lg capitalize">{product.name}</h2>
                  <p className="text-emerald-600 font-black text-sm whitespace-nowrap ml-2">
                    LKR {product.price}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <MapPin className="w-3.5 h-3.5" /> {product.sellerName || "Unknown Seller"} | {product.sellerEmail || "N/A"}
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                  Quantity: <span className="font-bold">{product.quantity}</span> | Status:{" "}
                  <span className="font-bold capitalize">{product.status}</span>
                </div>

                {/* Approve / Reject Buttons */}
                {product.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(product._id, "approved");
                      }}
                      className="flex-1 bg-emerald-600 text-white py-1 rounded-xl hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(product._id, "rejected");
                      }}
                      className="flex-1 bg-red-600 text-white py-1 rounded-xl hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening modal
                  handleDelete(product._id);
                }}
                className="absolute top-3 right-3 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
