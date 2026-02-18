import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Fruits",
    "Vegetables",
    "Eggs",
    "Oil",
    "Dairy",
    "Snacks",
    "Biscuits",
    "Bakery",
    "Grains",
    "Soft Drinks",
    "Malts & Drinking Powders",
    "Noodles And Pastas",
    "Pharmacy",
    "Spreads & Honey",
  ];

  useEffect(() => {
    let tempProducts = products || [];

    // Search filter
    if (searchQuery) {
      tempProducts = tempProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      tempProducts = tempProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(tempProducts);
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="mt-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col items-center mb-8">
        <p
          className="font-semibold uppercase text-green-700 tracking-wide"
          style={{ fontSize: "clamp(1.2rem, 4vw, 1.6rem)" }}
        >
          All Products
        </p>
        <div className="w-16 h-0.5 bg-green-500 rounded-full mt-2"></div>
      </div>

      {/* ===== CATEGORY BUTTONS ===== */}
      <div className="flex overflow-x-auto gap-3 mb-6 pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full font-medium transition whitespace-nowrap px-4 py-2 text-sm
              ${
                selectedCategory === cat
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-green-200"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ===== PRODUCT GRID ===== */}
      {filteredProducts.filter((product) => product?.inStock).length === 0 ? (
        <div className="text-center text-gray-500 py-16 text-lg">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredProducts
            .filter((product) => product?.inStock)
            .map((product, index) => (
              <div
                key={product.id}
                className="animate-productFade"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      )}

      {/* ===== ANIMATIONS ===== */}
      <style>
        {`
          @keyframes productFade {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .animate-productFade {
            animation: productFade 0.5s ease forwards;
          }

          /* Hide scrollbar for modern look */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

export default AllProducts;
