import React, { useState } from "react";
import { assets } from "../assets/assets";

const NewsLetter = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setIsSubscribed(true);
    }, 500);
  };

  return (
    <div className="w-full mt-24">
      {/* CONTENT */}
      <div className="flex flex-col items-center justify-center text-center px-4 pb-10">
        {isSubscribed ? (
          <div className="max-w-2xl w-full p-8 bg-green-50 border border-green-300 rounded-xl shadow-sm">
            <h1 className="md:text-4xl text-2xl font-semibold text-green-700">
              Thanks for Subscribing!
            </h1>
            <p className="md:text-lg text-gray-600 pt-3">
              You’ll now receive the latest offers and exclusive discounts from
              <span className="font-semibold"> kgsuper.com</span>
            </p>
          </div>
        ) : (
          <>
            <h1 className="md:text-4xl text-2xl font-semibold animate-blink">
              Never Miss a Deal!
            </h1>

            <p className="md:text-lg text-gray-500/70 mt-2 mb-8 max-w-xl">
              Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-2xl h-12 md:h-14 shadow-sm"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 border border-gray-300 rounded-l-md px-4 outline-none text-gray-600"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dull text-white px-6 md:px-10 rounded-r-md transition-all"
              >
                Subscribe
              </button>
            </form>
          </>
        )}
      </div>

      {/* IMAGE AT BOTTOM */}
      <div className="w-100">
       
      </div>

      {/* BLINK ANIMATION */}
      <style>
        {`
          @keyframes blink {
            0%, 50%, 100% { opacity: 1; }
            25%, 75% { opacity: 0; }
          }
          .animate-blink {
            animation: blink 1.5s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default NewsLetter;
