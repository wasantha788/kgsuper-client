import React from "react";
import { NavLink, Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { MessageSquare, Home, ChevronLeft, Search } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 md:px-8 py-4 shadow-sm border-b border-slate-100">
      
      {/* LEFT SIDE - LOGO & BACK */}
      <div className="flex items-center gap-4">
        <Link 
          to="/" 
          className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          title="Back to Home"
        >
          <ChevronLeft size={24} />
        </Link>
        
        <NavLink to="/">
          <img
            src={assets.logo}
            alt="logo"
            className="h-10 sm:h-12 w-auto transition-transform hover:scale-105"
          />
        </NavLink>
      </div>

      {/* CENTER - CHAT STATUS */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageSquare size={18} className="text-emerald-600" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">
            Customer Support
          </h1>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Online & Ready to Help
        </p>
      </div>
    </nav>
  );
};

export default Navbar;