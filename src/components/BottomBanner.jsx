import React, { useEffect, useState } from "react";
import { assets, features } from "../assets/assets";

const BottomBanner = () => {
  const headline = "Why we are the Best?";
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mt-24 overflow-hidden">

      {/* Desktop Image */}
      <img
        src={assets.bottom_banner_image}
        alt="banner"
        className="w-full hidden md:block"
      />

      {/* Mobile Image */}
      <img
        src={assets.bottom_banner_image_sm}
        alt="banner"
        className="w-full md:hidden"
      />

      <div className="absolute inset-0 flex flex-col items-center md:items-end md:justify-center pt-16 md:pt-0 md:pr-24 px-4 sm:px-6">
        <div>

          {/*  AUTO-ZOOM HEADLINE */}
          <h1
            className="font-bold text-primary mb-6 flex flex-wrap justify-center md:justify-end"
            style={{ fontSize: "clamp(1.8rem, 6vw, 3.5rem)" }}
          >
            {headline.split("").map((char, index) => (
              <span
                key={index}
                className={`inline-block ${animate ? "animate-letterFade" : ""}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          {features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-start gap-4 mt-4">

              <img
                src={feature.icon}
                alt={feature.title}
                className="w-9 sm:w-10 md:w-12 shrink-0"
              />

              <div>

                {/*  AUTO-ZOOM FEATURE TITLE */}
                <h3
                  className="font-bold flex flex-wrap"
                  style={{ fontSize: "clamp(1rem, 4vw, 1.5rem)" }}
                >
                  {feature.title.split("").map((char, index) => (
                    <span
                      key={index}
                      className={`inline-block ${animate ? "animate-bounceIn" : ""}`}
                      style={{
                        animationDelay: `${index * 0.05 + featureIndex * 0.3}s`,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </h3>

                {/*  AUTO-ZOOM DESCRIPTION */}
                <p
                  className="text-gray-500/70 mt-1"
                  style={{ fontSize: "clamp(0.8rem, 3vw, 1rem)" }}
                >
                  {feature.description}
                </p>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes letterFade {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .animate-letterFade {
            opacity: 0;
            animation: letterFade 0.5s forwards;
          }

          @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.5); }
            60% { opacity: 1; transform: scale(1.2); }
            100% { transform: scale(1); }
          }

          .animate-bounceIn {
            opacity: 1;
            animation: bounceIn 0.6s forwards;
          }
        `}
      </style>
    </div>
  );
};

export default BottomBanner;
