import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-rotate-map"; 
import { MapPin, Send, Compass } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import "leaflet/dist/leaflet.css";
import { assets } from "../assets/assets";

// Leaflet default icon fix
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// --- Helper: Calculate Bearing ---
const getBearing = (startLat, startLng, endLat, endLng) => {
  const startLatRad = (Math.PI * startLat) / 180;
  const startLngRad = (Math.PI * startLng) / 180;
  const endLatRad = (Math.PI * endLat) / 180;
  const endLngRad = (Math.PI * endLng) / 180;
  const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad);
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
            Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

const MapController = ({ deliveryLoc, customerLoc, isAutoRotate, rotation }) => {
  const map = useMap();
  useEffect(() => {
    if (deliveryLoc?.lat && customerLoc?.lat) {
      const bounds = L.latLngBounds([[deliveryLoc.lat, deliveryLoc.lng], [customerLoc.lat, customerLoc.lng]]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [deliveryLoc, customerLoc, map]);

  useEffect(() => {
    if (map.setBearing) map.setBearing(isAutoRotate ? 360 - rotation : 0);
  }, [isAutoRotate, rotation, map]);
  return null;
};

const CustomerChat = () => {
  const { orderId } = useParams();
  const { user, axios } = useAppContext();
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [customerLocation, setCustomerLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [stats, setStats] = useState({ distance: "0.0", duration: "0" });
  const [rotation, setRotation] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    const saved = localStorage.getItem(`delivery_loc_${orderId}`);
    return saved ? JSON.parse(saved) : null;
  });

  const homeIcon = new L.Icon({ iconUrl: assets.homeIconUrl, iconSize: [40, 40], iconAnchor: [20, 40] });
  const deliveryIcon = new L.Icon({ iconUrl: assets.deliveryIconUrl, iconSize: [45, 45], iconAnchor: [22, 22] });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (deliveryLocation && customerLocation) {
      setRotation(getBearing(deliveryLocation.lat, deliveryLocation.lng, customerLocation.lat, customerLocation.lng));
    }
  }, [deliveryLocation, customerLocation]);

  // --- Socket.io Logic ---
  useEffect(() => {
    if (!user?._id || !orderId) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, { 
      transports: ["websocket"], 
      withCredentials: true 
    });
    socketRef.current = socket;
    
    socket.on("connect", () => {
      socket.emit("join_order_room", orderId);
      socket.emit("request_location", { room: orderId });
    });

    socket.on("receive_location", ({ location }) => {
      if (location?.lat && location?.lng) {
        setDeliveryLocation(location);
        localStorage.setItem(`delivery_loc_${orderId}`, JSON.stringify(location));
      }
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        const isDuplicate = prev.some(m => m.timestamp === msg.timestamp && String(m.senderId) === String(msg.senderId));
        return isDuplicate ? prev : [...prev, msg];
      });
    });

    return () => socket.disconnect();
  }, [orderId, user?._id]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/order/${orderId}`);
        if (data.success) setOrder(data.order);
      } catch { toast.error("Order not found"); }
    };
    fetchOrder();
  }, [orderId, axios]);

  useEffect(() => {
    if (!deliveryLocation || !customerLocation) return;
    const getRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${deliveryLocation.lng},${deliveryLocation.lat};${customerLocation.lng},${customerLocation.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          setRouteCoords(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
          setStats({
            distance: (data.routes[0].distance / 1000).toFixed(1),
            duration: (data.routes[0].duration / 60).toFixed(0)
          });
        }
      } catch (err) { console.error(err); }
    };
    getRoute();
  }, [deliveryLocation, customerLocation]);

  const shareMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCustomerLocation(loc);
      socketRef.current?.emit("share_location", { room: orderId, location: loc });
      toast.success("Position synced");
    }, () => toast.error("Please enable GPS"));
  };

  const sendMessage = () => {
  if (!text.trim() || !socketRef.current) return;
  
  const msg = { 
    room: orderId, 
    message: text.trim(), 
    senderId: String(user._id), 
    senderName: user.name || (user.role === 'driver' ? "Driver" : "Customer"), 
    senderRole: user.role,
    timestamp: new Date().toISOString() 
  };

  // 1. Send to server
  socketRef.current.emit("send_message", msg);
  
  // 2. Add to your own screen immediately
  setMessages((prev) => [...prev, msg]);
  
  setText("");
};

  if (!order) return <div className="pt-32 text-center text-slate-400 animate-pulse font-bold">Connecting...</div>;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-50 overflow-y-auto p-4 pt-10">
      <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-10">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div>
                <h2 className="text-xs font-black uppercase tracking-tighter opacity-60">Live Tracking</h2>
                <p className="text-lg font-bold">Order #{orderId.slice(-6)}</p>
            </div>
            <button onClick={() => setIsAutoRotate(!isAutoRotate)} className={`p-3 rounded-full transition-all ${isAutoRotate ? 'bg-blue-600' : 'bg-slate-700'}`}>
              <Compass size={20} className={isAutoRotate ? "animate-pulse" : ""} />
            </button>
        </div>

        <div className="p-4">
            <div className="h-72 mb-4 rounded-3xl overflow-hidden relative border">
              <MapContainer center={[7.2906, 80.6337]} zoom={14} className="h-full w-full" zoomControl={false} rotate={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {deliveryLocation && <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}><Popup>Driver</Popup></Marker>}
                {customerLocation && <Marker position={[customerLocation.lat, customerLocation.lng]} icon={homeIcon}><Popup>You</Popup></Marker>}
                {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#2563eb" weight={6} opacity={0.7} />}
                <MapController deliveryLoc={deliveryLocation} customerLoc={customerLocation} isAutoRotate={isAutoRotate} rotation={rotation} />
              </MapContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 p-4 rounded-2xl border text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Distance</p>
                    <p className="text-xl font-black">{stats.distance} km</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Arrival</p>
                    <p className="text-xl font-black">{stats.duration} min</p>
                </div>
            </div>

            {/* MESSAGE BOX SECTION */}
           <div ref={scrollRef} className="h-44 overflow-y-auto mb-4 bg-slate-50/50 rounded-2xl p-4 flex flex-col gap-4 border">
  {messages.map((m, i) => {
    // String comparison is critical for MongoDB IDs
    const isMe = String(m.senderId) === String(user?._id);

    return (
      <div key={i} className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}>
        {/* SENDER LABEL */}
        <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
          {isMe ? "You" : (m.senderName || "Other")}
        </span>
        
        {/* MESSAGE BUBBLE */}
        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
          isMe 
            ? "bg-blue-600 text-white rounded-tr-none" // Right Side
            : "bg-white border text-slate-700 rounded-tl-none" // Left Side
        }`}>
          {m.message}
        </div>
      </div>
    );
  })}
</div>

            <div className="flex gap-2 mb-4">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type message..." className="flex-1 bg-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={sendMessage} className="bg-slate-900 text-white p-4 rounded-2xl active:scale-95"><Send size={20}/></button>
            </div>

            <button onClick={shareMyLocation} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <MapPin size={16} /> SYNC MY LIVE POSITION
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;