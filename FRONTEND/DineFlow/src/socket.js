import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);

  const kitchen = JSON.parse(localStorage.getItem("kitchen"));

  if (kitchen?._id) {
    socket.emit("join_kitchen");
  }
});

export default socket;