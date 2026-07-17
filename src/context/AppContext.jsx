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
  const getUserHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { token: token } : {};
  };

  const getSellerHeaders = () => {
    const token = localStorage.getItem("sellerToken");
    return token ? { token: token } : {}; // Backend එකේ req.headers.token කියවන්න ගැළපෙන ලෙස
  };

  const getDeliveryHeaders = () => {
    const token = localStorage.getItem("deliveryToken");
    return token ? { delivery_token: token } : {};
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

  // --- DARK MODE STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // ---------------- DARK MODE EFFECT ----------------
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // ---------------- FETCH USER ----------------
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    
    // 💡 Token එකක් නැත්නම් API call එකක් නොකර නවතින්න
    if (!token) {
      setUser(null);
      setCartItems({});
      setIsInitialLoad(false);
      return;
    }

    try {
      const { data } = await axios.get("/api/user/is-auth", { headers: getUserHeaders() });
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      console.log("User not logged in."); // Console clean තබා ගැනීමට
      setUser(null);
      setCartItems({});
    } finally {
      setIsInitialLoad(false);
    }
  };

 // ---------------- FETCH SELLER ----------------
// AppContext.jsx හි fetchSeller
const fetchSeller = async () => {
  const token = localStorage.getItem("sellerToken");
  if (!token) {
    setIsSeller(false);
    setUser(null);
    return;
  }

  try {
    const { data } = await axios.get("/api/seller/is-auth", { headers: getSellerHeaders() });
    if (data.success && data.seller) {
      setIsSeller(true);
      setUser(data.seller); // ✅ මෙහි _id ඇතුළත් වේ
    } else {
      setIsSeller(false);
      setUser(null);
    }
  } catch {
    setIsSeller(false);
    setUser(null);
  }
};

  // ---------------- FETCH DELIVERY ----------------
  const fetchdelivery = async () => {
    const token = localStorage.getItem("deliveryToken");
    
    // 💡 Token එකක් නැත්නම් API call එකක් නොකර නවතින්න
    if (!token) {
      setIsdelivery(false);
      return;
    }

    try {
      const { data } = await axios.get("/api/delivery/is-auth", {
        headers: getDeliveryHeaders()
      });
      setIsdelivery(!!data.success);
      if (data.success && data.user) setUser(data.user);
    } catch {
      console.log("Delivery boy not logged in.");
      setIsdelivery(false);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async (nav = null, redirect = true) => {
    try {
      await axios.post("/api/delivery/logout", {}, { headers: getDeliveryHeaders() });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("deliveryToken");
      setUser(null);
      setIsdelivery(false);
      setCartItems({}); 
      setIsInitialLoad(true); 
      toast.success("Logged out successfully");
      if (redirect && nav) nav("/delivery-login");
    }
  };

  // ---------------- LOGOUT SELLER ----------------
const Sellerlogout = async (nav = null, redirect = true) => {
  try {
    // ✅ Use getSellerHeaders() NOT getDeliveryHeaders()
    await axios.post("/api/seller/logout", {}, { headers: getSellerHeaders() });
  } catch {
    // ignore
  } finally {
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerId");   // ✅ Also remove sellerId
    setUser(null);
    setIsSeller(false);                    // ✅ Reset seller state
    setCartItems({}); 
    setIsInitialLoad(true); 
    toast.success("Logged out successfully");
    if (redirect && nav) nav("/seller-login");
  }
};


  

  // ---------------- SYNC CART TO DB ----------------
  useEffect(() => {
    const syncCart = async () => {
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
      await axios.put(`/api/delivery/order/${orderId}/mark-paid`, {}, { headers: getDeliveryHeaders() });
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
        getUserHeaders,
        getSellerHeaders,
        getDeliveryHeaders,
        isDarkMode, toggleDarkMode ,Sellerlogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);