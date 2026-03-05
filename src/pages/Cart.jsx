import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateCartItem,
    removeFromCart,
    getCartCount,
    getCartAmount,
    navigate,
    user,
    setCartItems,
    axios,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  const getUserAddress = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/address/get`, { withCredentials: true });
      if (data.success) {
        const fetchedAddresses = data.addresses || [];
        setAddresses(fetchedAddresses);
        setSelectedAddress(fetchedAddresses[0] || null);
        if (!fetchedAddresses.length) toast("No address found, please add one.");
      } else {
        toast.error(data.message || "Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error(error.response?.data?.message || "Error fetching addresses");
    }
  };

  useEffect(() => {
    const temp = Object.keys(cartItems)
      .map((id) => {
        const product = products.find((p) => p._id === id);
        return product ? { ...product, quantity: cartItems[id] } : null;
      })
      .filter(Boolean);
    setCartArray(temp);
  }, [cartItems, products]);

  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please log in to place order");
      navigate("/login");
      return;
    }
    if (!cartArray.length) {
      toast.error("Your cart is empty");
      return;
    }
    if (!selectedAddress || !selectedAddress._id) {
      toast.error("Please select a delivery address");
      return;
    }

    const items = cartArray.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const payload = {
      userId: user._id || user.id,
      items,
      address: selectedAddress._id,
      chatEnabled: true,
      locationEnabled: true,
    };

    try {
      const url = paymentOption === "COD" ? `${API_URL}/api/order/cod` : `${API_URL}/api/order/stripe`;
      const { data } = await axios.post(url, payload, { withCredentials: true });
      if (data.success) {
        toast.success(paymentOption === "COD" ? "Order placed successfully!" : "Redirecting to payment...");
        setCartItems({});
        if (paymentOption === "COD") navigate("/my-orders");
        else if (data.url) window.location.replace(data.url);
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error placing order");
    }
  };

  const handleQtyChange = (productId, value) => {
    updateCartItem(productId, Number(value));
    toast.success("Cart updated");
  };

  /* CHANGED: Wrapped empty states in main-bg/main-text */
  if (!user || !products.length || !cartArray.length) {
    return (
      <div className="flex justify-center items-center h-[80vh] bg-main-bg text-main-text transition-colors">
        <p className="opacity-60 text-xl font-semibold">
          {!user ? "Please log in to view cart." : "Your cart is empty."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen pt-24 pb-12 gap-8 px-4 md:px-12 text-lg bg-main-bg text-main-text transition-colors duration-300">
      
      {/* LEFT SIDE - Cart Items */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">
          Shopping Cart <span className="text-lg text-primary font-medium ml-2">{getCartCount()} Items</span>
        </h1>

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr] opacity-60 font-semibold pb-4 border-b border-main-border">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {/* Cart Items */}
        {cartArray.map((product) => (
          <div
            key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr] items-center border-b border-main-border/50 py-6 group"
          >
            <div className="flex items-center gap-4 md:gap-6">
              {/* Product Image Wrapper */}
              <div className="w-24 h-24 md:w-28 md:h-28 bg-card-bg border border-main-border rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                <img
                  src={Array.isArray(product.image) ? product.image[0] : product.image}
                  alt={product.name}
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight mb-1">{product.name}</p>
                <p className="opacity-60 text-sm">Weight: {product.weight || "N/A"}</p>

                <div className="flex items-center gap-3 text-sm mt-3">
                  <span className="font-medium">Qty:</span>
                  <select
                    value={product.quantity}
                    onChange={(e) => handleQtyChange(product._id, e.target.value)}
                    className="bg-card-bg border border-main-border px-2 py-1 rounded-lg focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <p className="text-center font-bold text-xl text-primary">
              {currency}{((product.offerPrice || product.price) * product.quantity).toFixed(2)}
            </p>

            <button
              onClick={() => removeFromCart(product._id)}
              className="mx-auto p-2 hover:bg-red-500/10 rounded-full transition-colors group-hover:scale-110"
            >
              <img src={assets.remove_icon} className="w-6 h-6 dark:brightness-200" alt="remove" />
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-primary mt-8 text-base font-bold hover:gap-4 transition-all"
        >
          <img src={assets.arrow_right_icon_colored} className="w-5 rotate-180" alt="" />
          Continue Shopping
        </button>
      </div>

      {/* RIGHT SIDE - Order Summary */}
      {/* CHANGED: bg-card-bg and border-main-border */}
      <div className="md:sticky md:top-24 h-fit max-w-100 w-full bg-card-bg p-8 border border-main-border rounded-2xl shadow-xl shadow-black/5">
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
        
        <div className="space-y-6">
          {/* Address Section */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider opacity-50 mb-2">Delivery Address</p>
            <div className="relative">
              <p className="text-base leading-relaxed">
                {selectedAddress
                  ? `${selectedAddress.street}, ${selectedAddress.city}`
                  : "No address found"}
              </p>

              <button
                onClick={() => setShowAddress(!showAddress)}
                className="text-primary text-sm font-bold underline mt-1 hover:text-primary-dull transition-colors"
              >
                Change Address
              </button>

              {showAddress && (
                <div className="absolute left-0 right-0 bg-card-bg border border-main-border mt-2 z-20 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                  {addresses.map((a, i) => (
                    <div
                      key={i}
                      className="p-4 cursor-pointer hover:bg-main-bg border-b border-main-border/30 last:border-0 text-sm"
                      onClick={() => {
                        setSelectedAddress(a);
                        setShowAddress(false);
                      }}
                    >
                      {a.street}, {a.city}
                    </div>
                  ))}
                  <div
                    onClick={() => navigate("/add-address")}
                    className="p-4 text-primary text-center font-bold hover:bg-primary/5 cursor-pointer text-sm"
                  >
                    + Add New Address
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider opacity-50 mb-2">Payment Method</p>
            <select
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value)}
              className="w-full bg-main-bg border border-main-border px-4 py-3 text-base rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="COD">Cash on Delivery</option>
              <option value="Online">Online (Stripe)</option>
            </select>
          </div>

          <hr className="border-main-border" />

          {/* Price Summary */}
          <div className="space-y-3">
            <div className="flex justify-between text-base opacity-80">
              <span>Subtotal</span>
              <span>{currency}{getCartAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="opacity-80">Shipping</span>
              <span className="text-green-500 font-bold uppercase text-xs bg-green-500/10 px-2 py-1 rounded">Free</span>
            </div>
            <div className="flex justify-between text-base opacity-80">
              <span>Tax (2%)</span>
              <span>{currency}{(getCartAmount() * 0.02).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 border-t border-main-border">
              <span>Total Amount</span>
              <span className="text-primary">{currency}{(getCartAmount() * 1.02).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            className="w-full bg-primary text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all mt-4"
          >
            {paymentOption === "COD" ? "Place Order" : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;