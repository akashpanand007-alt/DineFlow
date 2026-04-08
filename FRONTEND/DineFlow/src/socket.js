// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {


  // 🔥 Always join kitchen room if kitchen logged in
  const kitchen = JSON.parse(localStorage.getItem("kitchen"));

  if (kitchen?._id) {
    socket.emit("join_kitchen");
  }
});


export default socket;