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
  // State for responsive map properties
  const [mapHeight, setMapHeight] = useState("600px");
  const [mapCenter, setMapCenter] = useState(SHOP_POSITION);
  const [mapZoom, setMapZoom] = useState(18);

  // 🔄 Adjust map dynamically on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        // Mobile
        setMapHeight("350px");
        setMapZoom(16);
        setMapCenter([SHOP_POSITION[0] + 0.005, SHOP_POSITION[1]]);
      } else if (width < 1024) {
        // Tablet
        setMapHeight("500px");
        setMapZoom(17);
        setMapCenter(SHOP_POSITION);
      } else {
        // Desktop
        setMapHeight("600px");
        setMapZoom(18);
        setMapCenter(SHOP_POSITION);
      }
    };

    handleResize(); // Initial setup
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-white min-h-screen py-12 px-4 md:px-12 lg:px-20">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-green-700 mb-3">
          Our Shop Location 🗺️
        </h1>
        <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto">
          Find your way to us easily — the map below points you right to our doors.
        </p>
      </div>

      {/* Map Container */}
      <div className="w-full rounded-2xl shadow-2xl overflow-hidden border-4 border-green-500 transition-all duration-300">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: mapHeight }}
          className="w-full z-0"
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
        >
          {/* OpenStreetMap Tiles */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Zoom Control */}
          <ZoomControl position="bottomright" />

          {/* Shop Marker */}
          <Marker position={SHOP_POSITION} icon={shopIcon}>
            <Popup className="font-sans text-center">
              <strong className="text-green-600">K.G. Super Shop Is Here!</strong>
              <br />
              <span className="text-gray-500 text-xs mt-1 block">
                 Directions or details
              </span>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Footer / Additional Info */}
      <div className="mt-12 text-center text-gray-700">
        <p className="text-xl">Have a question? Contact us directly!</p>
      </div>
    </div>
  );
};

export default Map;
