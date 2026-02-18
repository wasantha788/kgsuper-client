import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import AdPopup from './AdPopup'; // Ensure this filename matches your popup component

function Mainbanner() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Initial animation trigger
    setAnimate(true);

    // Headline animation loop every 5 seconds
    const interval = setInterval(() => {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='relative w-full overflow-hidden'>
      {/* 1. The Popup Ad - Positioned in the left corner via its own internal CSS */}
      <AdPopup/>

      {/* Desktop Banner Background */}
      <img 
        src={assets.main_banner_bg} 
        alt="banner" 
        className='w-full hidden md:block' 
      />

      {/* Mobile Banner Background */}
      <img 
        src={assets.main_banner_bg_sm} 
        alt="banner" 
        className='w-full block md:hidden' 
      />

      {/* Headline + Buttons Overlay */}
      <div
        className="
          absolute inset-0
          /* MOBILE VIEW: text bottom/center */
          flex flex-col items-center justify-end
          text-[#157138]
          pb-16 px-6

          /* DESKTOP VIEW: text at top-left */
          md:items-start md:justify-start
          md:pt-10 md:pb-0
          md:pl-20 lg:pl-24
        "
      >
        {/* Animated Headline */}
        <h1
          className={`
            font-bold
            text-center md:text-left
            leading-tight
            max-w-70 md:max-w-lg
            ${animate ? 'animate-fade-slide' : ''}
          `}
          style={{ fontSize: 'clamp(1.4rem, 5vw, 3rem)' }}
        >
          Freshness You Can Trust, Savings You Will Love!
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center mt-6 font-medium gap-4">
          
          {/* SHOP NOW Button */}
          <Link
            to="/products"
            className="
              flex items-center gap-2
              px-5 md:px-9 py-3
              bg-primary hover:bg-primary-dull
              transition rounded text-white cursor-pointer
              whitespace-nowrap
            "
            style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)' }}
          >
            Shop now
            <img
              className="md:hidden"
              src={assets.white_arrow_icon}
              alt="arrow"
              style={{
                width: 'clamp(14px, 3vw, 16px)',
                height: 'clamp(14px, 3vw, 16px)'
              }}
            />
          </Link>

          {/* EXPLORE DEALS Button (Desktop Only) */}
          <Link
            to="/products"
            className="
              hidden md:flex items-center gap-2
              px-9 py-3
              border border-white/80
              backdrop-blur-sm bg-white/10
              cursor-pointer whitespace-nowrap
            "
            style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}
          >
            Explore deals
            <img
              src={assets.black_arrow_icon}
              alt="arrow"
              style={{ width: '16px', height: '16px' }}
            />
          </Link>
        </div>
      </div>

      {/* Internal CSS for Headline Animation */}
      <style>
        {`
          @keyframes fadeSlideIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-slide {
            animation: fadeSlideIn 1.2s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}

export default Mainbanner;