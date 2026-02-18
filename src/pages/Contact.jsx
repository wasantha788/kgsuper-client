import React from "react";
import emailjs from "emailjs-com";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";

// Custom Marker Icon
const shopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const Contact = () => {
  const position = [7.3486514, 80.3963151];

  const sendEmail = (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Sending your message... 📩");

    emailjs
      .sendForm(
        "wasantha123",
        "template_8koceos",
        e.target,
        "hoeOmjTSu70UT--Po"
      )
      .then(() => {
        emailjs
          .sendForm(
            "wasantha123",
            "template_hi2z6p8",
            e.target,
            "hoeOmjTSu70UT--Po"
          )
          .then(() => {
            toast.dismiss(loadingToast);
            toast.success(
              "Message sent successfully! 🛍️ Check your email for confirmation."
            );
            e.target.reset();
          })
          .catch(() => {
            toast.dismiss(loadingToast);
            toast.error("Message sent, but auto-reply failed ❌");
          });
      })
      .catch(() => {
        toast.dismiss(loadingToast);
        toast.error("Oops! Message sending failed 😔");
      });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white py-16 px-6 md:px-20 lg:px-32">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Contact Us
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Feel free to reach out anytime — we’re happy to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-md border hover:shadow-xl transition-all">
          <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>

          <form className="space-y-6" onSubmit={sendEmail}>
            <input
              type="text"
              name="user_name"
              placeholder="Your Name"
              required
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500"
            />

            <input
              type="email"
              name="user_email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500"
            />

            <textarea
              rows="5"
              name="message"
              placeholder="Write your message..."
              required
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500"
            />

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="flex items-center gap-4">
            <Mail className="text-green-600" />
            <p>kgsupershop@gmail.com</p>
          </div>

          <div className="flex items-center gap-4">
            <Phone className="text-green-600" />
            <p>035-2261599 / 070-1835063</p>
          </div>

          <Link to="/map" className="flex items-center gap-4">
            <MapPin className="text-green-600" />
            <span className="underline text-green-600 hover:text-green-700">
              View Full Map
            </span>
          </Link>
        </div>
      </div>

      {/* Map Preview */}
      <div className="mt-20 text-center">
        <h3 className="text-2xl font-semibold mb-6">Find Us on the Map</h3>

        <div className="relative w-full h-64 rounded-xl shadow-lg border border-green-500">
          {/* Click overlay */}
          <Link
            to="/map"
            className="absolute inset-0 z-10"
            aria-label="Open map"
          />

          {/* Map */}
          <MapContainer
            center={position}
            zoom={16}
            scrollWheelZoom={false}
            className="w-full h-full z-0"
            whenReady={(map) => {
              setTimeout(() => {
                map.target.invalidateSize();
              }, 100);
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={position} icon={shopIcon}>
              <Popup>Your Shop is Here!</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Contact;
