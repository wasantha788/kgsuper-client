import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../context/AppContext";

const BestSeller = () => {
  const { products } = useAppContext();

  const bestSellers = Array.isArray(products)
    ? products.filter((p) => p?.inStock === true).slice(0, 10)
    : [];

  return (
    <div className="mt-16 px-4 md:px-8">
      <p className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 wrap-break-word">
        Best Sellers
      </p>

      {!products ? (
        <p className="text-gray-500 mt-4 text-sm sm:text-base">Loading products...</p>
      ) : bestSellers.length === 0 ? (
        <p className="text-gray-500 mt-4 text-sm sm:text-base">No best sellers available.</p>
      ) : (
        <div className="overflow-x-auto flex gap-4 py-2 scroll-smooth scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-200">
          {bestSellers.map((product) => (
            <div
              key={product._id}
              className="shrink-0 w-40 sm:w-48 md:w-60"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Tailwind CSS Scrollbar styles */}
      <style>
        {`
          /* For Chrome, Edge, Safari */
          .scrollbar-thin::-webkit-scrollbar {
            height: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #e5e7eb; /* gray-200 */
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: #3b82f6; /* primary color */
            border-radius: 4px;
          }

          /* For Firefox */
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #e5e7eb;
          }
        `}
      </style>
    </div>
  );
};

export default BestSeller;
