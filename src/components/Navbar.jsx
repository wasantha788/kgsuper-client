import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import FloatingButtons from "../components/FloatingButtons";
// Added imports for AI Chat icons
import { MessageSquare, Send, X, Loader2, Sparkles } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // AI Chat State

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    user,
    setUser,
    setShowUserLogin,
    setSearchQuery,
    searchQuery,
    getCartCount,
    axios,
  } = useAppContext();

  /* ================= AI CHAT LOGIC ================= */
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const { data } = await axios.post("/api/ai/chat", { message: input });
      setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I'm offline. Try again later!" }]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    try {
      const { data } = await axios.post(
        "/api/user/logout",
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        setProfileOpen(false);
        setOpen(false);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Logout failed!");
    }
  };

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (searchQuery) navigate("/products");
  }, [searchQuery, navigate]);

  const navLinkClass =
    "relative px-2 py-1 text-green-800 hover:text-green-700 transition " +
    "after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] " +
    "after:bg-green-600 hover:after:w-full after:transition-all";

  return (
    <>
      <FloatingButtons />

      <nav className="sticky top-0 z-50 flex items-center justify-between
        px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28
        py-3 sm:py-4 md:py-5
        bg-green-50 border-b border-green-200 shadow-md">

        {/* LOGO */}
        <NavLink to="/" onClick={() => setOpen(false)}>
          <img
            src={assets.logo}
            alt="logo"
            className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20"
          />
        </NavLink>

        {/* ================= DESKTOP ================= */}
        <div className="hidden sm:flex items-center
          gap-6 md:gap-10 lg:gap-14 xl:gap-16
          text-sm md:text-base lg:text-lg font-semibold">

          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/products" className={navLinkClass}>All Products</NavLink>
          
          {/* AI CHAT TRIGGER */}
          <button 
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-1 text-green-700 hover:text-green-600 transition"
          >
            <Sparkles size={18} /> <span>AI Chat</span>
          </button>

          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>

          {/* SEARCH */}
          <div className="hidden lg:flex items-center gap-3
            border border-green-200 px-4 py-1 rounded-full
            bg-white shadow-sm w-56 xl:w-72">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none
              placeholder-green-400 text-sm xl:text-base"
              placeholder="Search groceries"
            />
            <img src={assets.search_icon} className="w-4 h-4" />
          </div>

          {/* CART */}
          <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} className="w-6 md:w-7 lg:w-8" />
            <span className="absolute -top-2 -right-3
              text-xs md:text-sm
              bg-green-600 text-white
              w-5 h-5 md:w-6 md:h-6
              flex items-center justify-center rounded-full font-bold">
              {getCartCount()}
            </span>
          </div>

          {/* PROFILE / LOGIN */}
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="px-5 md:px-7 py-2 md:py-3
              bg-green-600 hover:bg-green-500
              text-white rounded-full transition">
              Login
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <img
                src={assets.profile_icon}
                className="w-9 md:w-10 lg:w-12 cursor-pointer"
                onClick={() => setProfileOpen((p) => !p)}
              />

              {profileOpen && (
                <ul className="absolute right-0 mt-3
                  w-40 md:w-48
                  bg-white shadow-lg rounded-lg
                  border border-green-100">
                  <li
                    onClick={() => {
                      navigate("/my-orders");
                      setProfileOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-green-50 cursor-pointer">
                    My Orders
                  </li>
                  <li
                    onClick={logout}
                    className="px-4 py-2 hover:bg-green-50 cursor-pointer">
                    Logout
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ================= MOBILE ================= */}
        <div className="flex sm:hidden items-center gap-4">
          
          {/* MOBILE AI ICON */}
          <MessageSquare 
            onClick={() => setChatOpen(true)}
            className="text-green-700 w-6 h-6 cursor-pointer"
          />

          {/* CART */}
          <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} className="w-6" />
            <span className="absolute -top-1 -right-1
              text-xs bg-green-600 text-white
              w-5 h-5 flex items-center justify-center rounded-full">
              {getCartCount()}
            </span>
          </div>

          {/* PROFILE ICON */}
          {user && (
            <img
              src={assets.profile_icon}
              className="w-7 cursor-pointer"
            />
          )}

          {/* MENU */}
          <button onClick={() => setOpen(!open)}>
            <img src={assets.menu_icon} className="w-5 h-5 " />
          </button>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {open && (
          <div className="flex absolute top-17.5 left-0 w-full bg-green-50 shadow-md py-5 flex-col items-start gap-3 px-6 text-xs md:hidden z-50 border-t border-green-200">
            <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/products" onClick={() => setOpen(false)}>All Products</NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
            <NavLink to="/my-orders" onClick={() => setOpen(false)}>my orders</NavLink>

            {!user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className="px-6 py-1 mt-2 bg-green-600 hover:bg-green-500 text-white rounded-full text-xs transition">
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="px-6 py-1 mt-2 bg-green-600 hover:bg-green-500 text-white rounded-full text-xs transition">
                Logout
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ================= AI CHAT WINDOW ================= */}
      {chatOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col h-[500px] border border-green-100 overflow-hidden">
            <div className="bg-green-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <span className="font-semibold">Grocery AI</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-green-700 p-1 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-xs text-green-600 flex items-center gap-1"><Loader2 className="animate-spin" size={12}/> AI is thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask anything..."
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <button onClick={handleSendMessage} className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"><Send size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;