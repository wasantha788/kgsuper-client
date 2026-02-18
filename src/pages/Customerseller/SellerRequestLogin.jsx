import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Store, Leaf, ShieldCheck, ArrowRight } from "lucide-react";

export default function SellerRequestLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:4000/api/sellerrequestlogin",
        form
      );
      toast.success(res.data.message || "Login successful");
      localStorage.setItem("seller", JSON.stringify(res.data.seller));
      navigate("/seller-apply");
    } catch (err) {
      console.log(err.response?.data);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    /* Background updated to match the fresh emerald gradient of the shop */
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-100 to-green-50 px-4 relative overflow-hidden">
      
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-200 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(5,150,105,0.15)] p-10 border border-emerald-100/50">
          
          {/* Brand Header */}
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-3xl bg-emerald-600 shadow-xl shadow-emerald-200 mb-6 group transition-transform hover:scale-105">
              <Store className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-3 bg-emerald-50 w-fit mx-auto px-4 py-1.5 rounded-full border border-emerald-100">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">K.G SUPER Marketplace</span>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Seller Login</h2>
            <p className="text-slate-500 font-medium text-sm mt-2">Access your business dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                    <Mail className="text-slate-400 group-focus-within:text-emerald-600 w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="name@business.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-16 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                    <Lock className="text-slate-400 group-focus-within:text-emerald-600 w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-16 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="group w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.98] mt-6 flex items-center justify-center gap-3 text-lg"
            >
              Sign In to Store
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              Not a partner yet?{" "}
              <button
                onClick={() => navigate("/seller-request/register")}
                className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-4"
              >
                Register Business
              </button>
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Secure Connection</span>
        </div>
      </div>
    </div>
  );
}