// configs/socketServer.js

const activeKitchenSessions = new Set(); // login-based presence
let ioRef = null;

// ===== PUBLIC HELPERS (LOGIN / LOGOUT ONLY) =====
export const markKitchenOnline = (kitchenId) => {
  if (!kitchenId) return;

  activeKitchenSessions.add(String(kitchenId));

  if (ioRef) {
    ioRef.to("admins").emit(
      "active_kitchens_update",
      activeKitchenSessions.size
    );
  }
};

export const markKitchenOffline = (kitchenId) => {
  if (!kitchenId) return;

  activeKitchenSessions.delete(String(kitchenId));

  if (ioRef) {
    ioRef.to("admins").emit(
      "active_kitchens_update",
      activeKitchenSessions.size
    );
  }
};

export const getActiveKitchenCount = () =>
  activeKitchenSessions.size;

// ===== SOCKET SERVER INIT =====
export const initSocketServer = (io) => {
  ioRef = io;

  io.on("connection", (socket) => {

    // ADMIN JOIN
    socket.on("join_admin", () => {
      socket.join("admins");
      socket.emit(
        "active_kitchens_update",
        activeKitchenSessions.size
      );
    });

    // ✅ KITCHEN JOIN (required for kitchen notifications)
    socket.on("join_kitchen", () => {
      socket.join("kitchen");

    });

    // ❗ NO kitchen_online here
    // ❗ NO disconnect removal
    // Presence is LOGIN/LOGOUT based only

    socket.on("disconnect", () => {

    });
  });
};