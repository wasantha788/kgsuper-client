import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { products, addToCart, loading, relatedLoading } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((item) => item._id === id);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    if (product) setThumbnail(product.image?.[0] || product.image || null);
  }, [product]);

  useEffect(() => {
    if (products.length && product) {
      const filtered = products.filter(
        (item) => item.category === product.category && item._id !== product._id
      );
      setRelatedProducts(filtered.slice(0, 5));
    }
  }, [products, product]);

  /* CHANGED: Used main-text for loading/error states */
  if (loading) {
    return (
      <div className="m-12 text-center text-main-text animate-pulse">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="m-12 text-center text-red-500 font-medium">
        Product not found.
      </div>
    );
  }

  return (
    /* CHANGED: Added bg-main-bg and text-main-text */
    <div className="min-h-screen bg-main-bg text-main-text transition-colors duration-300 mx-0 px-4 sm:px-12 py-12">

      {/* Breadcrumb */}
      {/* CHANGED: opacity for secondary text instead of gray-500 */}
      <p
        className="opacity-60 mb-6"
        style={{ fontSize: "clamp(0.7rem, 2.8vw, 0.875rem)" }}
      >
        <Link to="/" className="hover:text-primary">Home</Link> /{" "}
        <Link to="/products" className="hover:text-primary">Products</Link> /{" "}
        {product.category && (
          <>
            <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-primary">
              {product.category}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-primary font-semibold">{product.name}</span>
      </p>

      {/* Product Details Container */}
      <div className="flex flex-col md:flex-row gap-10">

        {/* Images Section */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {Array.isArray(product.image) ? (
              product.image.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setThumbnail(img)}
                  /* CHANGED: border-main-border and bg-card-bg */
                  className={`border rounded-lg cursor-pointer overflow-hidden transition-all bg-card-bg ${
                    thumbnail === img ? "border-primary ring-2 ring-primary/20" : "border-main-border"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="border border-main-border rounded-lg overflow-hidden bg-card-bg">
                <img src={product.image} alt="Product" className="w-16 h-16 sm:w-20 sm:h-20 object-cover" />
              </div>
            )}
          </div>

          {/* Main Image */}
          {/* CHANGED: border-main-border and bg-card-bg */}
          <div className="border border-main-border bg-card-bg rounded-2xl flex items-center justify-center w-full md:w-[450px] aspect-square overflow-hidden shadow-sm">
            <img
              src={thumbnail}
              alt="Selected product"
              className="object-contain max-h-[90%] transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-6">
          <h1
            className="font-bold leading-tight"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.2rem)" }}
          >
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array(5).fill(0).map((_, i) => (
                <img
                  key={i}
                  src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt="rating"
                  className="w-4 h-4"
                />
              ))}
            </div>
            <span className="text-sm opacity-50">(4.0 Rating)</span>
          </div>

          {/* Price */}
          <div className="py-4 border-y border-main-border/50">
            {product.offerPrice && product.offerPrice < product.price && (
              <p
                className="opacity-50 line-through"
                style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)" }}
              >
                MRP: Rs {product.price}
              </p>
            )}

            <div className="flex items-baseline gap-3">
              <p
                className="font-bold text-primary"
                style={{ fontSize: "clamp(1.5rem, 4.5vw, 2rem)" }}
              >
                Rs {product.offerPrice || product.price}
              </p>
              <span className="opacity-60 text-sm">(inclusive of all taxes)</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="font-semibold text-lg mb-2">About Product</p>
            <ul
              className="space-y-2 opacity-80 list-disc ml-5"
              style={{ fontSize: "clamp(0.9rem, 3vw, 1rem)" }}
            >
              {Array.isArray(product.description)
                ? product.description.map((desc, idx) => (
                    <li key={idx} className="pl-1">{desc}</li>
                  ))
                : <li>{product.description}</li>}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <button
              onClick={() => addToCart(product._id)}
              /* CHANGED: bg-main-border/30 for dark mode compatibility */
              className="w-full py-4 font-bold rounded-xl bg-main-border/30 hover:bg-main-border/50 transition-all active:scale-95"
            >
              Add to Cart
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="w-full py-4 font-bold rounded-xl bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-24">
        <div className="flex flex-col items-center mb-10">
          <h2
            className="font-bold"
            style={{ fontSize: "clamp(1.2rem, 4vw, 1.75rem)" }}
          >
            Related Products
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mt-3"></div>
        </div>

        {relatedLoading ? (
          <p className="text-center opacity-50">Loading matches...</p>
        ) : relatedProducts.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        ) : (
          <p className="text-center opacity-40 italic">No similar products found.</p>
        )}

        <div className="flex justify-center mt-16">
          <button
            onClick={() => {
              navigate("/products");
              window.scrollTo(0, 0);
            }}
            /* CHANGED: text-primary and border-primary */
            className="px-12 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
          >
            See more products
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;