

const activeKitchenSessions = new Set(); 
let ioRef = null;


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


export const initSocketServer = (io) => {
  ioRef = io;

  io.on("connection", (socket) => {


    socket.on("join_admin", () => {
      socket.join("admins");
      socket.emit(
        "active_kitchens_update",
        activeKitchenSessions.size
      );
    });

   
    socket.on("join_kitchen", () => {
      socket.join("kitchen");

    });


    socket.on("disconnect", () => {

    });
  });
};