import { io } from "socket.io-client";

// Connect to BACKEND service URL
const socket = io("https://kgsuper-server-production.up.railway.app", {
  withCredentials: true,
  transports: ["websocket"]
});

export default socket;
