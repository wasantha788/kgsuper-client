import React, { useState } from "react";
import { FaFacebookMessenger, FaWhatsapp, FaTimes, FaComments } from "react-icons/fa";

const FloatingButtons = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-72 md:top-80 right-4 md:right-6 flex flex-col items-end z-50">

      {/* Floating Icons */}
      <div
        className={`flex flex-col items-center gap-2 md:gap-3 mb-3
        transition-all duration-300
        ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"}`}
      >

        {/* Messenger */}
        <a
          href="https://m.me/YOUR_PAGE_ID"
          target="_blank"
          rel="noopener noreferrer"
          className="
            w-10 h-10 md:w-12 md:h-12
            rounded-full shadow-lg
            flex items-center justify-center
            bg-linear-to-br from-purple-500 to-blue-500
          "
        >
          <FaFacebookMessenger className="text-white text-lg md:text-xl" />
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/94701835063"
          target="_blank"
          rel="noopener noreferrer"
          className="
            w-10 h-10 md:w-12 md:h-12
            rounded-full shadow-lg
            flex items-center justify-center
            bg-green-500
          "
        >
          <FaWhatsapp className="text-white text-lg md:text-xl" />
        </a>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          w-12 h-12 md:w-14 md:h-14
          rounded-full shadow-xl
          bg-lime-500
          flex items-center justify-center
        "
      >
        {open ? (
          <FaTimes className="text-white text-xl md:text-2xl" />
        ) : (
          <FaComments className="text-white text-xl md:text-2xl" />
        )}
      </button>
    </div>
  );
};

export default FloatingButtons;
