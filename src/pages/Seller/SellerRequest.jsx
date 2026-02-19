import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, MapPin, RefreshCcw, X, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {noImage} from "../../assets/assets";

export default function SellerRequest() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const API_URL = "https://kgsuper-server-production.up.railway.app";

  /* ---------------- FETCH ---------------- */
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
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  /* ---------------- SEARCH FILTER ---------------- */
  useEffect(() => {
    const results = products.filter((product) =>
      `${product.name} ${product.sellerName} ${product.sellerEmail}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/api/sellerRequest/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setFilteredProducts((prev) => prev.filter((p) => p._id !== id));
      if (selectedProduct?._id === id) setSelectedProduct(null);
      toast.success("Deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    }
  };

  /* ---------------- STATUS UPDATE ---------------- */
  const handleChangeStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/sellerRequest/update-status/${id}`,
        { status }
      );

      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status } : p))
        );

        setFilteredProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status } : p))
        );

        if (selectedProduct?._id === id)
          setSelectedProduct({ ...selectedProduct, status });

        toast.success(`Status updated to ${status}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Status update failed.");
    }
  };

  /* ---------------- LOADING SCREEN ---------------- */
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">
          Fetching all requests...
        </p>
      </div>
    );
  }

  /* ---------------- COMPONENT ---------------- */
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Toaster position="top-right" />

      {/* ================= MODAL ================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative overflow-y-auto max-h-[90vh]">

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:text-red-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col lg:flex-row gap-4 p-6">

              {/* Images */}
              <div className="lg:w-1/2 flex flex-col gap-3">
                {selectedProduct.images?.length ? (
                  selectedProduct.images.map((img, i) => {
                    const imageUrl = `${API_URL}/${img.replace(/\\/g, "/")}`;
                    return (
                      <img
                        key={i}
                        src={imageUrl}
                        alt="product"
                        onError={(e) => (e.target.src = noImage)}
                        className="w-full h-64 object-cover rounded-xl cursor-pointer"
                        onClick={() => setSelectedImage(imageUrl)}
                      />
                    );
                  })
                ) : (
                  <img
                    src={noImage}
                    alt="no-image"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
              </div>

              {/* Details */}
              <div className="lg:w-1/2 space-y-4">
                <h2 className="text-3xl font-black capitalize">
                  {selectedProduct.name}
                </h2>

                <p className="text-2xl font-bold text-emerald-600">
                  LKR {Number(selectedProduct.price || 0).toLocaleString()}
                </p>

                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl italic">
                  {selectedProduct.description || "No description"}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Info label="Category" value={selectedProduct.category} />
                  <Info label="Quantity" value={selectedProduct.quantity} />
                  <Info label="Weight" value={selectedProduct.weight} />
                  <Info label="Status" value={selectedProduct.status} />
                </div>

                {selectedProduct.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedProduct._id, "approved")
                      }
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleChangeStatus(selectedProduct._id, "rejected")
                      }
                      className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= GRID ================= */}
      <main className="p-6 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed col-span-full">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">
              No results matching your search.
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const imageUrl = product.images?.[0]
              ? `${API_URL}/${product.images[0].replace(/\\/g, "/")}`
              : noImage;

            return (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-3xl shadow border overflow-hidden hover:shadow-xl transition cursor-pointer relative"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="product"
                    onError={(e) => (e.target.src = noImage)}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 space-y-2">
                  <h2 className="font-bold capitalize">
                    {product.name}
                  </h2>

                  <p className="text-emerald-600 font-bold">
                    LKR {Number(product.price || 0).toLocaleString()}
                  </p>

                  <p className="text-xs text-gray-400">
                    {product.sellerName || "Unknown Seller"}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(product._id);
                  }}
                  className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

/* -------- SMALL INFO COMPONENT -------- */
function Info({ label, value }) {
  return (
    <div className="p-3 border rounded-xl">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold capitalize">{value || "N/A"}</p>
    </div>
  );
}
