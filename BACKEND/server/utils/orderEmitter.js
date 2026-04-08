const Order = require("../models/Order");

/**
 * Normalize order for sockets
 */
async function serializeOrder(orderId) {
  const o = await Order.findById(orderId)
    .populate("tableId", "number");

  if (!o) return null;

  const obj = o.toObject();

  return {
    ...obj,
    tableName: o.tableId?.number || `Table ${o.tableId?.number || ""}`
  };
}

/**
 * Emit normalized order to rooms
 */
async function emitOrder(io, event, orderId, rooms = ["admins"]) {
  const payload = await serializeOrder(orderId);
  if (!payload) return;

  rooms.forEach(r => io.to(r).emit(event, payload));
}

module.exports = { serializeOrder, emitOrder };