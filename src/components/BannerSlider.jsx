import React, { useEffect } from "react";
import Splide from "@splidejs/splide";
import "@splidejs/splide/dist/css/splide.min.css";
import banner1 from "../assets/banner-1.jpg";
import banner4 from "../assets/banner-4.jpg";
import banner3 from "../assets/banner-3.jpg";

const BannerSlider = () => {
  useEffect(() => {
    new Splide(".bannerSplide", {
      type: "loop",
      perPage: 1,
      autoplay: true,
      interval: 3500,
      arrows: true,
      pagination: false,
      speed: 900,
      pauseOnHover: false,
      gap: "1rem",
      breakpoints: {
        640: { perPage: 1, gap: "0.5rem" },
        768: { perPage: 1, gap: "0.75rem" },
      },
    }).mount();
  }, []);

  return (
    <div className="w-full relative py-4">
      <div className="splide bannerSplide rounded-xl overflow-hidden shadow-lg">
        <div className="splide__track">
          <ul className="splide__list">

            {[banner1, banner4, banner3].map((banner, index) => (
              <li key={index} className="splide__slide w-full flex justify-center">
                <div className="w-full sm:w-full md:w-full lg:w-full overflow-hidden">
                  <img
                    src={banner}
                    alt={`Offer ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </li>
            ))}

          </ul>
        </div>
      </div>
    </div>
  );
};

export default BannerSlider;
