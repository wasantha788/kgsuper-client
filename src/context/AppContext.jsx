import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Axios defaults
axios.defaults.withCredentials = true; // send cookies automatically
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  // --- HELPERS ---
  const getHeaders = () => {
  // Check for sellerToken first, then deliveryToken
  const token = localStorage.getItem("token") || 
                localStorage.getItem("sellerToken") || 
                localStorage.getItem("deliveryToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

  // --- STATE ---
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isdelivery, setIsdelivery] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserLogin, setShowUserLogin] = useState(false);
  
  // CRITICAL: Prevent sync before initial DB fetch is complete
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ---------------- FETCH USER ----------------
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth", { headers: getHeaders() });
      if (data.success) {
        setUser(data.user);
        // Set state from DB - this is the "truth"
        setCartItems(data.user.cartItems || {});
      } else {
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      console.error("Auth check failed", error);
      setUser(null);
      setCartItems({});
    } finally {
      // Data is now loaded from DB, safe to enable sync effect
      setIsInitialLoad(false);
    }
  };

  // ---------------- FETCH SELLER ----------------
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setIsSeller(!!data.success);
    } catch {
      setIsSeller(false);
    }
  };

  // ---------------- FETCH DELIVERY ----------------
  const fetchdelivery = async () => {
    try {
      const { data } = await axios.get("/api/delivery/is-auth", {
        headers: getHeaders()
      });
      setIsdelivery(!!data.success);
      if (data.success && data.user) setUser(data.user);
    } catch {
      setIsdelivery(false);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async (nav = null, redirect = true) => {
    try {
      await axios.post("/api/delivery/logout", {}, { headers: getHeaders() });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("deliveryToken");
      setUser(null);
      setIsdelivery(false);
      setCartItems({}); // Clear cart on logout
      setIsInitialLoad(true); // Reset guard for next user
      toast.success("Logged out successfully");
      if (redirect && nav) nav("/delivery-login");
    }
  };

  // ---------------- SYNC CART TO DB ----------------
  useEffect(() => {
    const syncCart = async () => {
      // Only sync if user exists AND we finished fetching initial data
      if (!user?._id || isInitialLoad) return;

      try {
        await axios.post("/api/cart/update", { 
          userId: user._id, 
          cartItems 
        });
      } catch (error) {
        console.error("Sync error:", error);
      }
    };

    const delayDebounceFn = setTimeout(syncCart, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [cartItems, user?._id, isInitialLoad]);

         
  // ---------------- CART HELPERS ----------------
  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    toast.success("Added to Cart");
  };

  const updateCartItem = (itemId, quantity) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (quantity <= 0) delete updated[itemId];
      else updated[itemId] = quantity;
      return updated;
    });
    toast.success("Cart Updated");
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId] -= 1;
      else delete updated[itemId];
      return updated;
    });
    toast.success("Removed from Cart");
  };

  const getCartCount = () => Object.values(cartItems).reduce((a, b) => a + b, 0);

  const getCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (product) {
        total += (product.offerPrice || product.price || 0) * cartItems[id];
      }
    }
    return Math.round(total * 100) / 100;
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) setProducts(data.products || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markAsPaid = async (orderId, nav = null) => {
    try {
      await axios.put(`/api/delivery/order/${orderId}/mark-paid`, {}, { headers: getHeaders() });
      toast.success("Payment marked as PAID ✅");
      fetchdelivery();
    } catch (err) {
      if (err.response?.status === 401) logout(nav, true);
      else toast.error(err.response?.data?.message || "Failed to mark payment");
    }
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
    fetchdelivery();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user, setUser,
        isSeller, setIsSeller,
        isdelivery, fetchdelivery, setIsdelivery,
        products, fetchProducts,
        currency, cartItems,
        addToCart, navigate,
        updateCartItem, removeFromCart,
        getCartCount, getCartAmount,
        searchQuery, setSearchQuery,
        showUserLogin, setShowUserLogin,
        axios, setCartItems,
        logout, markAsPaid,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);