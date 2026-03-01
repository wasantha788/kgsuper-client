import React from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../assets/assets";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-16 px-3 sm:px-4 md:px-8 overflow-hidden bg-main-bg transition-colors duration-300">

      {/* AUTO-ZOOM TITLE */}
      <p
        className="font-semibold mb-6 text-main-text"
        style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)" }}
      >
        Categories
      </p>

      <div className="overflow-x-hidden relative">
        {/* Subtle Gradient Fade for the edges to make the scroll look "infinite" */}
        <div className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-main-bg to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-main-bg to-transparent pointer-events-none"></div>

        <div className="flex gap-4 sm:gap-6 animate-scroll whitespace-nowrap py-4">

          {[...categories, ...categories].map((category, index) => (
            <div
              key={index}
              onClick={() => {
                navigate(`/products/${category.path.toLowerCase()}`);
                window.scrollTo(0, 0);
              }}
              className="
                group cursor-pointer flex flex-col items-center justify-center
                rounded-2xl shadow-md transition-all duration-300
                hover:scale-105 hover:shadow-xl shrink-0
                p-4 sm:p-6 border border-main-border/10
              "
              style={{
                // Dark Mode Fix: We use an RGBA value to keep category color subtle in dark mode
                backgroundColor: category.bgColor, 
                minWidth: "clamp(120px, 38vw, 150px)"
              }}
            >
              {/* Image Container with a subtle shadow overlay */}
              <div className="rounded-full flex justify-center items-center overflow-hidden mb-3 bg-white/40 backdrop-blur-sm shadow-inner"
                style={{
                  width: "clamp(60px, 20vw, 128px)",
                  height: "clamp(60px, 20vw, 128px)"
                }}
              >
                <img
                  src={category.image}
                  alt={category.text}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* AUTO-ZOOM TEXT */}
              <p
                className="font-bold text-gray-800 dark:text-slate-100 drop-shadow-sm"
                style={{ fontSize: "clamp(0.75rem, 3vw, 1.125rem)" }}
              >
                {category.text}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* Global CSS for the infinite scroll */}
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          .animate-scroll {
            animation: scroll 25s linear infinite;
          }

          .animate-scroll:hover {
            animation-play-state: paused;
          }

          /* Dark Mode Adjustment for specific category bg colors */
          .dark .group {
            filter: saturate(0.8) brightness(0.9);
          }
        `}
      </style>
    </div>
  );
};

export default Categories;