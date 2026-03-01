import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 📍 Fixed Shop Location
const SHOP_POSITION = [7.3486514, 80.3963151];

// 🛒 Custom Marker Icon
const shopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
});

const Map = () => {
  const [mapHeight, setMapHeight] = useState("600px");
  const [mapCenter, setMapCenter] = useState(SHOP_POSITION);
  const [mapZoom, setMapZoom] = useState(18);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setMapHeight("350px");
        setMapZoom(16);
        setMapCenter([SHOP_POSITION[0] + 0.002, SHOP_POSITION[1]]);
      } else if (width < 1024) {
        setMapHeight("500px");
        setMapZoom(17);
        setMapCenter(SHOP_POSITION);
      } else {
        setMapHeight("600px");
        setMapZoom(18);
        setMapCenter(SHOP_POSITION);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    /* CHANGED: Used bg-main-bg and text-main-text */
    <div className="bg-main-bg min-h-screen py-12 px-4 md:px-12 lg:px-20 transition-colors duration-300">
      
      {/* Header */}
      <div className="text-center mb-10">
        {/* CHANGED: text-primary for the title */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-3">
          Our Shop Location 🗺️
        </h1>
        <p className="text-main-text opacity-70 text-base md:text-xl max-w-2xl mx-auto">
          Find your way to us easily — the map below points you right to our doors.
        </p>
      </div>

      {/* Map Container */}
      {/* CHANGED: border-primary and shadow handling */}
      <div className="w-full rounded-2xl shadow-2xl overflow-hidden border-4 border-primary transition-all duration-300">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: mapHeight }}
          /* CRITICAL DARK MODE FIX: 
             The filter below inverts the map colors and adjusts hue 
             to make standard tiles look like a "Dark Mode" map.
          */
          className="w-full z-0 dark:brightness-[0.6] dark:invert-[1] dark:hue-rotate-[180deg] dark:contrast-[1.1]"
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          <ZoomControl position="bottomright" />

          <Marker position={SHOP_POSITION} icon={shopIcon}>
            {/* CHANGED: Styled Popup for Dark Mode support */}
            <Popup className="font-sans text-center">
              <div className="p-1">
                <strong className="text-primary text-lg block">K.G. Super Shop</strong>
                <span className="text-gray-500 dark:text-gray-400 text-xs mt-1 block font-medium">
                   We are open and ready to serve you!
                </span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-main-text">
        <p className="text-xl font-medium">Have a question? Contact us directly!</p>
      </div>
    </div>
  );
};

export default Map;