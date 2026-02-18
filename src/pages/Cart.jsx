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

  // Redirect if user not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch user addresses
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

  // Build cart array from context
  useEffect(() => {
    const temp = Object.keys(cartItems)
      .map((id) => {
        const product = products.find((p) => p._id === id);
        return product ? { ...product, quantity: cartItems[id] } : null;
      })
      .filter(Boolean);
    setCartArray(temp);
  }, [cartItems, products]);

  // Fetch addresses when user is available
  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  // ------------------------
  // PLACE ORDER FUNCTION
  // ------------------------
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

    // Updated payload to include chatEnabled & locationEnabled
    const payload = {
      userId: user._id || user.id,
      items,
      address: selectedAddress._id,
      chatEnabled: true,      // enable chat by default
      locationEnabled: true,  // enable live location by default
    };

    console.log("Order Payload:", payload);

    try {
      const url =
        paymentOption === "COD"
          ? `${API_URL}/api/order/cod`
          : `${API_URL}/api/order/stripe`;

      const { data } = await axios.post(url, payload, { withCredentials: true });

      if (data.success) {
        toast.success(
          paymentOption === "COD"
            ? "Order placed successfully! Chat & location features enabled."
            : "Redirecting to payment..."
        );

        setCartItems({});

        if (paymentOption === "COD") {
          navigate("/my-orders");
        } else if (data.url) {
          window.location.replace(data.url);
        }
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Place order error:", error);
      toast.error(error.response?.data?.message || "Error placing order");
    }
  };

  // Handle quantity change
  const handleQtyChange = (productId, value) => {
    updateCartItem(productId, Number(value));
    toast.success("Cart updated");
  };

  // Render empty states
  if (!user) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-gray-500 text-xl font-semibold">Please log in to view cart.</p>
      </div>
    );
  }

  if (!products.length || !cartArray.length) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-gray-500 text-xl font-semibold">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row mt-16 gap-8 px-4 md:px-12 text-lg">
      {/* LEFT SIDE - Cart Items */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">
          Shopping Cart <span className="text-lg text-primary font-medium">{getCartCount()} Items</span>
        </h1>

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-700 font-semibold pb-3">
          <p>Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {/* Cart Items */}
        {cartArray.map((product) => (
          <div
            key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr] items-center text-gray-800 border-t border-gray-300/30 py-4"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-28 h-28 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={Array.isArray(product.image) ? product.image[0] : product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold text-lg">{product.name}</p>
                <p className="text-gray-500 text-base">Weight: {product.weight || "N/A"}</p>

                <div className="flex items-center gap-2 text-base mt-1">
                  <p>Qty:</p>
                  <select
                    value={product.quantity}
                    onChange={(e) => handleQtyChange(product._id, e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded"
                  >
                    {Array.from({ length: Math.max(product.quantity, 10) }).map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <p className="text-center font-medium text-lg">
              {currency}{((product.offerPrice || product.price) * product.quantity).toFixed(2)}
            </p>

            <button
              onClick={() => removeFromCart(product._id)}
              className="mx-auto cursor-pointer"
            >
              <img src={assets.remove_icon} className="w-7 h-7" alt="remove" />
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-primary mt-6 text-lg font-medium"
        >
          <img src={assets.arrow_right_icon_colored} className="w-6" />
          Continue Shopping
        </button>
      </div>

      {/* RIGHT SIDE - Order Summary */}
      <div className="max-w-100 w-full bg-gray-100 p-6 border border-gray-300 rounded text-lg">
        <h2 className="text-2xl font-bold">Order Summary</h2>
        <hr className="my-4 border-gray-300" />

        {/* Address */}
        <p className="text-base font-semibold">Delivery Address</p>
        <div className="relative mt-2">
          <p className="text-gray-700 text-base">
            {selectedAddress
              ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
              : "No address found"}
          </p>

          <button
            onClick={() => setShowAddress(!showAddress)}
            className="text-primary text-base underline mt-1"
          >
            Change
          </button>

          {showAddress && (
            <div className="absolute bg-white border border-gray-300 w-full mt-1 z-10 text-base shadow-md">
              {addresses.map((a, i) => (
                <p
                  key={i}
                  className="p-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedAddress(a);
                    setShowAddress(false);
                  }}
                >
                  {a.street}, {a.city}, {a.state}, {a.country}
                </p>
              ))}
              <p
                onClick={() => navigate("/add-address")}
                className="text-primary text-center p-3 cursor-pointer hover:bg-primary/10"
              >
                Add Address
              </p>
            </div>
          )}
        </div>

        {/* Payment */}
        <p className="text-base font-semibold mt-6">Payment Method</p>
        <select
          value={paymentOption}
          onChange={(e) => setPaymentOption(e.target.value)}
          className="w-full border border-gray-300 px-3 py-3 mt-2 text-base rounded"
        >
          <option value="COD">Cash on Delivery</option>
          <option value="Online">Online Payment</option>
        </select>

        <hr className="my-4 border-gray-300" />

        {/* Price Summary */}
        <div className="text-gray-700 space-y-3">
          <p className="flex justify-between text-base">
            <span>Price</span>
            <span>{currency}{getCartAmount().toFixed(2)}</span>
          </p>
          <p className="flex justify-between text-base">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between text-base">
            <span>Tax (2%)</span>
            <span>{currency}{(getCartAmount() * 0.02).toFixed(2)}</span>
          </p>
          <p className="flex justify-between text-lg font-bold pt-2">
            <span>Total Amount:</span>
            <span>{currency}{(getCartAmount() * 1.02).toFixed(2)}</span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full bg-primary text-white py-4 mt-5 rounded text-lg font-semibold"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;
