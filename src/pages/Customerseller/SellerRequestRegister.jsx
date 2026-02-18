import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Store, Leaf, ShieldCheck } from "lucide-react";

export default function SellerRequestRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/sellerrequestusers", form);
      toast.success(res.data.message || "Registration successful!");
      navigate("/seller-request/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-100 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background visual elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-emerald-300 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-green-300 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/10 overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50">
        
        {/* Left Side: Branding & Value Proposition */}
        <div className="md:w-[45%] bg-emerald-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            
            <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
              <Leaf className="w-3 h-3 text-emerald-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">K.G SUPER Partnership</span>
            </div>

            <h1 className="text-4xl font-black mb-6 leading-[1.1] tracking-tight">
              Scale your <br /> 
              <span className="text-emerald-300">Fresh Business</span> <br /> 
              with us.
            </h1>
            
            <p className="text-emerald-100/80 text-sm leading-relaxed max-w-xs font-medium">
              Join the largest network of fresh produce sellers. Reach thousands of customers looking for quality daily.
            </p>
          </div>

          <div className="relative z-10 mt-12 bg-emerald-800/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-700 bg-emerald-400 overflow-hidden">
                   <div className="w-full h-full bg-linear-to-tr from-emerald-500 to-emerald-300" />
                </div>
              ))}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-emerald-700 bg-white text-[11px] text-emerald-700 font-black">+2k</div>
            </div>
            <p className="text-xs font-bold text-emerald-50">"Our revenue doubled within 3 months of joining K.G SUPER."</p>
            <p className="text-[10px] text-emerald-300/80 mt-1 uppercase tracking-tighter">— Local Farm Partner</p>
          </div>

          {/* Artistic background shapes for the side panel */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full -mr-24 -mt-24 opacity-40 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900 rounded-full -ml-24 -mb-24 opacity-40 blur-3xl" />
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:w-[55%] p-8 md:p-14 lg:p-16 bg-white">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Partner Registration</h2>
            <p className="text-slate-500 font-medium text-sm mt-2">Let's set up your merchant presence.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all outline-none text-sm font-bold"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Business Email</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="business@example.com"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all outline-none text-sm font-bold"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all outline-none text-sm font-bold"
                  required
                />
              </div>
            </div>

            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 group mt-8 active:scale-[0.98]">
              Create Merchant Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 text-center flex flex-col items-center gap-4">
            <p className="text-sm font-medium text-slate-500">
              Part of the family?{" "}
              <Link to="/seller-request/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-4">
                Sign in here
              </Link>
            </p>
            
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure Data Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}