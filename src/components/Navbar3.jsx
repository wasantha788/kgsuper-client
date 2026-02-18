import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { LayoutDashboard, LogOut, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-white border-b border-slate-100 px-6 py-4 shadow-sm">
      {/* LEFT SIDE - LOGO */}
      <NavLink to="/" className="flex items-center gap-2 group">
        <img
          src={assets.logo}
          alt="logo"
          className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
        />
        <div className="hidden sm:block">
          <p className="text-xs font-black text-slate-900 tracking-[0.2em] uppercase leading-none">
            KG Super
          </p>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
            Logistics
          </p>
        </div>
      </NavLink>

      {/* RIGHT SIDE - ACTIONS */}
      <div className="flex items-center gap-3">
        {/* DASHBOARD LINK (Formerly Delivery Boy) */}
        <NavLink
          to="/send"
          className={({ isActive }) =>
            `relative flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 font-black text-[10px] tracking-widest uppercase border ${
              isActive
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                : "text-slate-500 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 bg-slate-50"
            }`
          }
        >
          <LayoutDashboard size={14} />
          <span>Delivery Terminal</span>
          
          {/* Active indicator dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </NavLink>

        {/* PROFILE ICON / SEPARATOR */}
        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-slate-100">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;