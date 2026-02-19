import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
    if (!socket) {
        // Replace with your actual backend URL
        socket = io("https://kgsuper-server-production.up.railway.app"); 
    }
    return socket;
};
