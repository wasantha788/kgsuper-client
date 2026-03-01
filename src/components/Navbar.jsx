import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import FloatingButtons from "../components/FloatingButtons";
import { 
  MessageSquare, Send, X, Loader2, Sparkles, 
  Moon, Sun, User, ShoppingBag, LogOut, Menu 
} from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // AI Chat Internal State
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    user,
    logout,
    setShowUserLogin,
    setSearchQuery,
    searchQuery,
    getCartCount,
    axios,
    isDarkMode,
    toggleDarkMode
  } = useAppContext();

  /* ================= SEARCH LOGIC ================= */
  useEffect(() => {
    if (searchQuery) navigate("/products");
  }, [searchQuery, navigate]);

  /* ================= AI CHAT LOGIC ================= */
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

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `relative px-2 py-1 transition-all duration-300 ${
      isActive ? "text-primary font-bold" : "text-main-text hover:text-primary"
    } after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-primary after:transition-all after:duration-300 ${
      isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
    }`;

  return (
    <>
      <FloatingButtons />

      <nav className="sticky top-0 z-50 flex items-center justify-between
        px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28
        py-3 sm:py-4 bg-main-bg border-b border-main-border shadow-md transition-all duration-300">

        {/* LOGO */}
        <NavLink to="/" onClick={() => setOpen(false)} className="transition-transform hover:scale-105">
          <img
            src={assets.logo}
            alt="logo"
            className="h-10 sm:h-12 md:h-14 lg:h-16"
          />
        </NavLink>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden sm:flex items-center gap-6 md:gap-8 lg:gap-12 font-semibold">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          
          <button 
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-1.5 text-primary hover:scale-105 transition-transform"
          >
            <Sparkles size={18} /> <span>AI Chat</span>
          </button>

          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>

          {/* SEARCH BOX */}
          <div className="hidden lg:flex items-center gap-3 border border-main-border px-4 py-1.5 rounded-full bg-card-bg shadow-inner w-48 xl:w-64 focus-within:border-primary transition-all">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none placeholder-gray-400 text-main-text text-sm"
              placeholder="Search..."
            />
            <img src={assets.search_icon} className="w-4 h-4 dark:invert opacity-60" alt="search" />
          </div>
          
          {/* ACTIONS */}
          <div className="flex items-center gap-4 border-l border-main-border pl-6">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-main-text transition-colors">
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>

            <div onClick={() => navigate("/cart")} className="relative cursor-pointer group">
              <img src={assets.nav_cart_icon} className="w-6 md:w-7 dark:invert group-hover:scale-110 transition-transform" alt="cart" />
              <span className="absolute -top-2 -right-2 text-[10px] bg-primary text-white w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                {getCartCount()}
              </span>
            </div>

            {/* PROFILE DROPDOWN */}
            {!user ? (
              <button onClick={() => setShowUserLogin(true)} className="px-6 py-2 bg-primary hover:brightness-110 text-white rounded-full transition-all shadow-md active:scale-95">
                Login
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <img src={assets.profile_icon} className="w-full h-full object-cover dark:invert" alt="profile" />
                </div>

                {profileOpen && (
                  <ul className="absolute right-0 mt-3 w-56 bg-card-bg shadow-2xl rounded-2xl border border-main-border text-main-text overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <li className="px-4 py-3 border-b border-main-border bg-main-bg/30">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Account</p>
                      <p className="text-sm font-bold truncate text-primary">{user.name}</p>
                    </li>
                    <li onClick={() => { navigate("/profile"); setProfileOpen(false); }} className="px-4 py-3 hover:bg-primary/10 cursor-pointer flex items-center gap-3 transition-colors">
                      <User size={16} className="text-primary" /> Profile Settings
                    </li>
                    <li onClick={() => { navigate("/my-orders"); setProfileOpen(false); }} className="px-4 py-3 hover:bg-primary/10 cursor-pointer flex items-center gap-3 transition-colors">
                      <ShoppingBag size={16} className="text-primary" /> My Orders
                    </li>
                    <li onClick={() => { logout(); setProfileOpen(false); }} className="px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center gap-3 text-red-500 border-t border-main-border transition-colors">
                      <LogOut size={16} /> Logout
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= MOBILE NAV (ICON ROW) ================= */}
        <div className="flex sm:hidden items-center gap-4">
          <button onClick={toggleDarkMode} className="text-main-text p-1">
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          
          {/* AI ICON - Explicitly added for small screens */}
          <button 
            onClick={() => setChatOpen(true)} 
            className="text-primary p-1 active:scale-90 transition-transform"
          >
            <Sparkles size={22} />
          </button>

          <div onClick={() => navigate("/cart")} className="relative p-1">
            <img src={assets.nav_cart_icon} className="w-7 dark:invert" alt="cart" />
            <span className="absolute top-0 right-0 text-[9px] bg-primary text-white w-4 h-4 flex items-center justify-center rounded-full font-bold">
              {getCartCount()}
            </span>
          </div>
          
          <button onClick={() => setOpen(!open)} className="text-main-text p-1">
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* MOBILE MENU PANEL (SIDEBAR) */}
        <div className={`fixed inset-y-0 right-0 w-3/4 max-w-xs bg-main-bg shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out sm:hidden ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex flex-col h-full p-8">
            <div className="flex justify-between items-center mb-10">
              <span className="font-bold text-xl text-primary uppercase">Menu</span>
              <X onClick={() => setOpen(false)} className="text-main-text cursor-pointer" />
            </div>
            
            <div className="flex flex-col gap-6 text-lg font-medium">
              <NavLink to="/" onClick={() => setOpen(false)} className="text-main-text">Home</NavLink>
              <NavLink to="/products" onClick={() => setOpen(false)} className="text-main-text">All Products</NavLink>
              
              {/* AI CHAT ALSO ACCESSIBLE IN MENU */}
              <button 
                onClick={() => { setChatOpen(true); setOpen(false); }} 
                className="flex items-center gap-2 text-primary font-bold text-left"
              >
                <Sparkles size={20} /> AI Assistant
              </button>

              <NavLink to="/contact" onClick={() => setOpen(false)} className="text-main-text">Contact</NavLink>
              
              {user && (
                <div className="flex flex-col gap-6 pt-6 border-t border-main-border">
                  <NavLink to="/profile" onClick={() => setOpen(false)} className="text-main-text">Profile Settings</NavLink>
                  <NavLink to="/my-orders" onClick={() => setOpen(false)} className="text-main-text">My Orders</NavLink>
                </div>
              )}
            </div>

            <div className="mt-auto pt-10 border-t border-main-border">
              <button 
                onClick={() => { user ? logout() : setShowUserLogin(true); setOpen(false); }} 
                className={`w-full py-4 rounded-2xl font-bold transition-all ${user ? "bg-red-500/10 text-red-500" : "bg-primary text-white"}`}
              >
                {user ? "Logout" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= AI CHAT MODAL ================= */}
      {chatOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card-bg rounded-3xl shadow-2xl flex flex-col h-[600px] max-h-[85vh] border border-main-border overflow-hidden scale-up-center">
             <div className="bg-primary p-5 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg"><Sparkles size={20} /></div>
                  <div>
                    <p className="font-bold leading-none">Grocery AI</p>
                    <p className="text-[10px] opacity-80 mt-1">Always here to help</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-main-bg/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-card-bg text-main-text border border-main-border rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-primary font-medium p-2 bg-primary/5 w-max rounded-lg">
                    <Loader2 className="animate-spin" size={14}/> 
                    <span className="text-xs">AI is typing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
             </div>

             <div className="p-4 bg-card-bg border-t border-main-border flex gap-3">
                <input 
                  type="text" 
                  className="flex-1 border border-main-border bg-main-bg rounded-2xl px-5 py-3 text-sm text-main-text outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                  placeholder="Ask about fruits, prices..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="bg-primary text-white p-3 rounded-2xl hover:shadow-lg hover:brightness-110 active:scale-90 transition-all shadow-md"><Send size={20} /></button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;