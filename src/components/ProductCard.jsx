import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems } = useAppContext();
  const navigate = useNavigate();

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product._id);
  };

  const handleRemoveFromCart = (e) => {
    e.stopPropagation();
    removeFromCart(product._id);
  };

  return (
    <div
      onClick={() => {
        navigate(`/product/${product._id}`);
        window.scrollTo(0, 0);
      }}
      className="
        bg-white border border-gray-200 rounded-lg shadow-sm
        hover:shadow-md transition cursor-pointer
        flex flex-col justify-between
        p-3 sm:p-4
        min-w-37.5 sm:min-w-45
        max-w-47.5 sm:max-w-55
      "
    >
      {/* Image */}
      <div className="flex justify-center items-center h-36 sm:h-44 bg-gray-50 rounded-lg mb-3 overflow-hidden">
        <img
          src={product.image?.[0] || assets.placeholder_image}
          alt={product.name}
          className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1">

        {/* Category */}
        <p
          className="text-gray-400"
          style={{ fontSize: "clamp(0.65rem, 2.5vw, 0.75rem)" }}
        >
          {product.category}
        </p>

        {/* Name */}
        <p
          className="font-semibold text-gray-800 truncate"
          style={{ fontSize: "clamp(0.8rem, 3vw, 1rem)" }}
        >
          {product.name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {Array(5).fill(0).map((_, i) => (
            <img
              key={i}
              src={i < 4 ? assets.star_icon : assets.star_dull_icon}
              alt="star"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            />
          ))}
          <span
            className="text-gray-500"
            style={{ fontSize: "clamp(0.6rem, 2.5vw, 0.75rem)" }}
          >
            (4)
          </span>
        </div>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mt-2 gap-2">

          {/* Price */}
          <div>
            <p
              className="font-bold text-indigo-600"
              style={{ fontSize: "clamp(0.9rem, 3.5vw, 1.05rem)" }}
            >
              Rs {product.offerPrice || product.price}
            </p>

            {product.offerPrice && (
              <p
                className="text-gray-400 line-through"
                style={{ fontSize: "clamp(0.65rem, 2.8vw, 0.8rem)" }}
              >
                Rs {product.price}
              </p>
            )}
          </div>

          {/* Cart Controls */}
          {!cartItems[product._id] ? (
            <button
              onClick={handleAddToCart}
              className="
                bg-indigo-100 text-indigo-600
                px-2 sm:px-3 py-1
                rounded flex items-center gap-1
                hover:bg-indigo-200 transition
                whitespace-nowrap
              "
              style={{ fontSize: "clamp(0.65rem, 2.8vw, 0.8rem)" }}
            >
              <img src={assets.cart_icon} alt="cart" className="w-3.5 h-3.5" />
              Add
            </button>
          ) : (
            <div
              className="
                flex items-center border border-indigo-200
                rounded text-indigo-600 overflow-hidden
              "
              style={{ fontSize: "clamp(0.65rem, 2.8vw, 0.8rem)" }}
            >
              <button
                onClick={handleRemoveFromCart}
                className="px-2 py-1 hover:bg-indigo-100 transition"
              >
                −
              </button>
              <span className="px-2 py-1">
                {cartItems[product._id]}
              </span>
              <button
                onClick={handleAddToCart}
                className="px-2 py-1 hover:bg-indigo-100 transition"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
