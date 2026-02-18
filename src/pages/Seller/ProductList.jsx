import React from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();

  // Toggle Stock
  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post("/api/product/stock", { id, inStock });
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const { data } = await axios.post("/api/product/delete", { id });
      if (data.success) {
        fetchProducts();
        toast.success("Product deleted successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-3000 p-4 md:p-10 space-y-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 pb-4">
          All Products
        </h2>

        {/* Desktop Table */}
        <div className="hidden md:block w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="table-auto w-full">
            <thead className="bg-gray-100 text-gray-800 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Selling Price</th>
                <th className="px-4 py-3 font-semibold">In Stock</th>
                <th className="px-4 py-3 font-semibold text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={Array.isArray(product.image) ? product.image[0] : product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span className="truncate">{product.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {Array.isArray(product.category) ? product.category.join(", ") : product.category}
                    </td>
                    <td className="px-4 py-3">
                      {currency}{product.offerPrice}
                    </td>
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer gap-3">
                        <input
                          type="checkbox"
                          checked={product.inStock}
                          onChange={() => toggleStock(product._id, !product.inStock)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors"></div>
                        <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={Array.isArray(product.image) ? product.image[0] : product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                    <p className="text-gray-500 text-sm truncate">
                      {Array.isArray(product.category) ? product.category.join(", ") : product.category}
                    </p>
                    <p className="text-gray-700 font-medium">
                      {currency}{product.offerPrice}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="relative inline-flex items-center cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={() => toggleStock(product._id, !product.inStock)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors"></div>
                    <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                    <span className="text-gray-700 text-sm">In Stock</span>
                  </label>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
