import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
    if (!socket) {
        // Replace with your actual backend URL
        socket = io("http://localhost:4000"); 
    }
    return socket;
};