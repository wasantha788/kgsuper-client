import React from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../assets/assets";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-16 px-3 sm:px-4 md:px-8 overflow-hidden">

      {/* AUTO-ZOOM TITLE */}
      <p
        className="font-semibold mb-6"
        style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)" }}
      >
        Categories
      </p>

      <div className="overflow-x-hidden">
        <div className="flex gap-4 sm:gap-6 animate-scroll whitespace-nowrap">

          {[...categories, ...categories].map((category, index) => (
            <div
              key={index}
              onClick={() => {
                navigate(`/products/${category.path.toLowerCase()}`);
                window.scrollTo(0, 0);
              }}
              className="
                group cursor-pointer flex flex-col items-center justify-center
                rounded-xl shadow-lg transition-transform duration-300
                hover:scale-105 shrink-0
                p-4 sm:p-6
              "
              style={{
                backgroundColor: category.bgColor,
                minWidth: "clamp(120px, 38vw, 150px)"
              }}
            >
              {/* Image */}
              <div className="rounded-full flex justify-center items-center overflow-hidden mb-3"
                style={{
                  width: "clamp(60px, 20vw, 128px)",
                  height: "clamp(60px, 20vw, 128px)"
                }}
              >
                <img
                  src={category.image}
                  alt={category.text}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* AUTO-ZOOM TEXT */}
              <p
                className="font-semibold text-center"
                style={{ fontSize: "clamp(0.75rem, 3vw, 1.125rem)" }}
              >
                {category.text}
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* Animation */}
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          .animate-scroll {
            animation: scroll 18s linear infinite;
          }

          /* Touch friendly snapping */
          .group {
            scroll-snap-align: start;
          }
        `}
      </style>
    </div>
  );
};

export default Categories;
