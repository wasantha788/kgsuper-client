import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-rotate-map"; 
import { MapPin, Send, Compass } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import "leaflet/dist/leaflet.css";
import { assets } from "../../assets/assets";

// Fix Leaflet default icon pathing
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

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
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [deliveryLoc, customerLoc, map]);

  useEffect(() => {
    if (map.setBearing) map.setBearing(isAutoRotate ? 360 - rotation : 0);
  }, [isAutoRotate, rotation, map]);
  return null;
};

const DeliveryOrderConnect = () => {
  const { orderId } = useParams();
  const { user } = useAppContext();
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

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

  useEffect(() => {
    if (!user?._id) return;
    const socket = io(import.meta.env.VITE_BACKEND_URL, { transports: ["websocket"], withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
        socket.emit("join_order_room", orderId);
        socket.emit("request_location", { room: orderId });
    });

    socket.on("receive_location", ({ location }) => {
      if (location?.lat) setCustomerLocation(location);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        const exists = prev.some(m => m.timestamp === msg.timestamp && String(m.senderId) === String(msg.senderId));
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socket.disconnect();
    };
  }, [orderId, user?._id, deliveryLocation]);

  useEffect(() => {
    if (!deliveryLocation || !customerLocation) return;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${deliveryLocation.lng},${deliveryLocation.lat};${customerLocation.lng},${customerLocation.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          setRouteCoords(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
          setDistance((data.routes[0].distance / 1000).toFixed(2));
          setDuration((data.routes[0].duration / 60).toFixed(0));
        }
      } catch (err) { console.error(err); }
    };
    fetchRoute();
  }, [deliveryLocation, customerLocation]);

  const startLiveTracking = () => {
    if (!navigator.geolocation) return toast.error("GPS not supported");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDeliveryLocation(loc);
        socketRef.current?.emit("share_location", { room: orderId, location: loc });
      },
      (err) => toast.error("GPS Error"),
      { enableHighAccuracy: true, distanceFilter: 5 }
    );
    toast.success("Tracking active");
  };

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;
    
    const msg = { 
        room: orderId, 
        message: text.trim(), 
        senderId: String(user._id), 
        senderName: user.name || "Driver", 
        senderRole: "driver",
        timestamp: new Date().toISOString() 
    };

    socketRef.current.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    /* FIXED: Hide navbar with fixed inset and high z-index */
    <div className="fixed inset-0 z-[999] bg-slate-50 overflow-y-auto p-4 pt-10">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-10">
        
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-widest">Delivery Console</h2>
          <button onClick={() => setIsAutoRotate(!isAutoRotate)} className={`p-2 rounded-lg ${isAutoRotate ? 'bg-blue-500' : 'bg-slate-700'}`}>
            <Compass size={18} className={isAutoRotate ? "animate-pulse" : ""} />
          </button>
        </div>

        <div className="h-80 relative z-0">
          <MapContainer center={[7.2906, 80.6337]} zoom={15} className="h-full w-full" zoomControl={false} rotate={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {deliveryLocation && <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}><Popup>You</Popup></Marker>}
            {customerLocation && <Marker position={[customerLocation.lat, customerLocation.lng]} icon={homeIcon}><Popup>Customer</Popup></Marker>}
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#2563eb" weight={5} opacity={0.6} />}
            <MapController deliveryLoc={deliveryLocation} customerLoc={customerLocation} isAutoRotate={isAutoRotate} rotation={rotation} />
          </MapContainer>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-3 rounded-2xl border text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Distance</p>
              <p className="text-xl font-black text-blue-600">{distance || "0.0"} km</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Est. Time</p>
              <p className="text-xl font-black text-blue-600">{duration || "0"} min</p>
            </div>
          </div>

          <div ref={scrollRef} className="h-44 overflow-y-auto mb-4 bg-slate-50/50 rounded-2xl p-4 flex flex-col gap-4 border">
            {messages.length === 0 && <p className="text-center text-slate-300 text-xs mt-10">No messages</p>}
            {messages.map((m, i) => {
              const isMe = String(m.senderId) === String(user?._id);
              return (
                <div key={i} className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}>
                  {/* SENDER NAME LABEL */}
                  <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                    {isMe ? "You" : (m.senderName || "Customer")}
                  </span>
                  
                  <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    isMe 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-white border text-slate-700 rounded-tl-none"
                  }`}>
                    {m.message}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type message..." className="flex-1 bg-slate-100 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={sendMessage} className="bg-blue-600 text-white p-4 rounded-2xl active:scale-90"><Send size={18} /></button>
          </div>

          <button onClick={startLiveTracking} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-all ${deliveryLocation ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-white active:scale-95'}`}>
            <MapPin size={20} /> {deliveryLocation ? 'TRACKING ACTIVE' : 'START LIVE TRACKING'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderConnect;