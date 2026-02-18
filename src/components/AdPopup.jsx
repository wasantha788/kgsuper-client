import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { assets } from "../assets/assets";

export default function AdPopup() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  

    useEffect(() => {
    const initialTimer = setTimeout(() => {
      setShow(true);
    }, 2000);

    const interval = setInterval(() => {
      setShow(true);
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);


  const handleClose = (e) => {
    e.stopPropagation();
    setShow(false);
  };

  const handleNavigate = () => {
    setShow(false);
    navigate("/seller-request/login");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      {/* Added 'group' here so children can respond to hover on this container */}
      <div className="bg-white w-64 md:w-72 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 p-5 relative group transition-all duration-300">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <p className="text-[12px] text-green-600 font-bold uppercase tracking-wider mb-1">
            Welcome back!
          </p>

          <h3 className="text-base font-extrabold text-gray-900 mb-4">
            Still interested?
          </h3>

          {/* UPGRADED IMAGE SIZE */}
          <div className="w-32 h-32 bg-gray-50 rounded-xl mb-4 overflow-hidden ring-1 ring-gray-100 shadow-inner">
            <img
              src={assets.sellerAdpng}
              alt="Seller Promotion"
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          <p className="text-sm font-bold text-gray-800 mb-4">
            Start selling and grow your business today
          </p>

          {/* APPLY BUTTON - Changes to Green on Group Hover */}
          <button
            onClick={handleNavigate}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 
                       bg-black text-white 
                       group-hover:bg-green-600 group-hover:shadow-lg group-hover:shadow-green-200"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}