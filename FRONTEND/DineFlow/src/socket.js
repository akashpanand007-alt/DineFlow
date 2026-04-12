import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],  
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  const kitchen = JSON.parse(localStorage.getItem("kitchen"));
  const admin = JSON.parse(localStorage.getItem("admin"));

  if (kitchen?._id) socket.emit("join_kitchen");
  if (admin?._id) socket.emit("join_admin");
});

export default socket;