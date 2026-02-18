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

  // Set main thumbnail
  useEffect(() => {
    if (product) setThumbnail(product.image?.[0] || product.image || null);
  }, [product]);

  // Get related products
  useEffect(() => {
    if (products.length && product) {
      const filtered = products.filter(
        (item) => item.category === product.category && item._id !== product._id
      );
      setRelatedProducts(filtered.slice(0, 5));
    }
  }, [products, product]);

  if (loading) {
    return (
      <div className="m-12 text-center text-gray-600">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="m-12 text-center text-red-500">
        Product not found.
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-12 my-12">

      {/* Breadcrumb */}
      <p
        className="text-gray-500"
        style={{ fontSize: "clamp(0.7rem, 2.8vw, 0.875rem)" }}
      >
        <Link to="/">Home</Link> /{" "}
        <Link to="/products">Products</Link> /{" "}
        {product.category && (
          <>
            <Link to={`/products/${product.category.toLowerCase()}`}>
              {product.category}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-primary font-medium">{product.name}</span>
      </p>

      {/* Product Details */}
      <div className="flex flex-col md:flex-row gap-10 mt-6">

        {/* Images */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {Array.isArray(product.image)
              ? product.image.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setThumbnail(img)}
                    className={`border rounded cursor-pointer overflow-hidden ${
                      thumbnail === img ? "border-primary" : "border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                    />
                  </div>
                ))
              : (
                <div className="border rounded overflow-hidden">
                  <img
                    src={product.image}
                    alt="Product"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                  />
                </div>
              )}
          </div>

          {/* Main Image */}
          <div className="border border-gray-300 rounded flex items-center justify-center w-70 h-70 sm:w-87.5 sm:h-87.5">
            <img
              src={thumbnail}
              alt="Selected product"
              className="object-contain max-h-80"
            />
          </div>
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2">

          {/* Product Name */}
          <h1
            className="font-medium"
            style={{ fontSize: "clamp(1.4rem, 5vw, 1.9rem)" }}
          >
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex gap-1 mt-2">
            {Array(5).fill(0).map((_, i) => (
              <img
                key={i}
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="rating"
                className="w-4 h-4"
              />
            ))}
          </div>

          {/* Price */}
          <div className="mt-6">
            {product.offerPrice && product.offerPrice < product.price && (
              <p
                className="text-gray-500/70 line-through"
                style={{ fontSize: "clamp(0.75rem, 3vw, 0.875rem)" }}
              >
                MRP: Rs {product.price}
              </p>
            )}

            <p
              className="font-medium text-primary"
              style={{ fontSize: "clamp(1.2rem, 4.5vw, 1.6rem)" }}
            >
              Rs {product.offerPrice || product.price}
            </p>

            <span
              className="text-gray-500/70"
              style={{ fontSize: "clamp(0.7rem, 3vw, 0.875rem)" }}
            >
              (inclusive of all taxes)
            </span>
          </div>

          {/* Description */}
          <p
            className="font-medium mt-6"
            style={{ fontSize: "clamp(0.9rem, 3.5vw, 1rem)" }}
          >
            About Product
          </p>

          <ul
            className="list-disc ml-4 text-gray-600 mt-2"
            style={{ fontSize: "clamp(0.8rem, 3vw, 0.95rem)" }}
          >
            {Array.isArray(product.description)
              ? product.description.map((desc, idx) => (
                  <li key={idx}>{desc}</li>
                ))
              : <li>{product.description}</li>}
          </ul>

          {/* Buttons */}
          <div
            className="flex items-center mt-10 gap-4"
            style={{ fontSize: "clamp(0.8rem, 3vw, 1rem)" }}
          >
            <button
              onClick={() => addToCart(product._id)}
              className="w-full py-3.5 font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
            >
              Add to Cart
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="w-full py-3.5 font-medium bg-primary text-white hover:bg-primary/80 transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20">
        <div className="flex flex-col items-center">
          <p
            className="font-medium"
            style={{ fontSize: "clamp(1rem, 4vw, 1.25rem)" }}
          >
            Related Products
          </p>
          <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>

          {relatedLoading ? (
            <p className="text-gray-500 mt-6">Loading related products...</p>
          ) : relatedProducts.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-6 w-full gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-6">No related products found.</p>
          )}

          <button
            onClick={() => {
              navigate("/products");
              window.scrollTo(0, 0);
            }}
            className="px-10 py-2.5 border rounded text-primary hover:bg-primary/10 transition mt-16"
          >
            See more
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
