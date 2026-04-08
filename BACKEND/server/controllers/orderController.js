const Order = require("../models/Order.js");
const Table = require("../models/Table.js");

/**
 * Sync table status with order state
 */
const syncTableStatus = async (tableId, orderStatus) => {
  if (!tableId) return;

  let status = "Available";

  if (["CREATED", "OTP_PENDING", "OTP_VERIFIED", "CONFIRMED"].includes(orderStatus)) {
    status = "Occupied";
  }

  if (["COMPLETED", "CANCELLED", "REJECTED"].includes(orderStatus)) {
    status = "Available";
  }

  await Table.findByIdAndUpdate(tableId, { status });
};

/**
 * Build payload for sockets
 */
const buildOrderPayload = async (orderId) => {
  const order = await Order.findById(orderId).populate("tableId", "number");

  if (!order) return null;

  return {
    ...order.toObject(),
    tableName:
      order.tableId?.number ||
      `Table ${order.tableId?.number || ""}`
  };
};

/**
 * 1️⃣ Customer places order
 */
exports.placeOrder = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { tableId, items, totalAmount, paymentMethod } = req.body;

    if (!tableId || !items || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!["PAY_LATER", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    const activeOrder = await Order.findOne({
      tableId,
      orderStatus: {
        $in: ["CREATED", "OTP_PENDING", "OTP_VERIFIED", "CONFIRMED"]
      }
    });

    if (activeOrder) {
      return res.status(409).json({
        success: false,
        message: "An active order already exists for this table",
        existingOrderId: activeOrder._id
      });
    }

    const isOnline = paymentMethod === "ONLINE";

    const order = new Order({
      tableId,
      items,
      totalAmount,
      payment: {
        method: paymentMethod,
        status: isOnline ? "PENDING" : "SUCCESS"
      },
      adminApproval: {
        approved: false,
        rejected: false
      },
      kitchenStatus: "WAITING",
      orderStatus: "CREATED"
    });

    await order.save();

    const payload = await buildOrderPayload(order._id);

    /**
     * PAY AT TABLE → live immediately
     */
    if (!isOnline) {
      await syncTableStatus(tableId, "CREATED");

      io.to("admins").emit("new_order_alert", payload);
    }

    res.status(201).json({
      success: true,
      message: isOnline
        ? "Order created. Waiting for payment confirmation."
        : "Order placed successfully",
      order: payload
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order placement failed",
      error
    });
  }
};


/**
 * 2️⃣ Confirm ONLINE payment
 */
exports.confirmPayment = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { orderId, transactionId } = req.body;

    if (!orderId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment information"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.payment.method !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "Payment confirmation not required for PAY_LATER"
      });
    }

    if (order.payment.status === "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Payment already confirmed"
      });
    }

    order.payment.status = "SUCCESS";
    order.payment.transactionId = transactionId;

    await order.save();

    await syncTableStatus(order.tableId, "CREATED");

    const payload = await buildOrderPayload(order._id);

    /**
     * Now order becomes LIVE
     */
    io.to("admins").emit("new_order_alert", payload);

    res.status(200).json({
      success: true,
      message: "Payment confirmed. Order is now live.",
      order: payload
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment confirmation failed",
      error
    });
  }
};


/**
 * 3️⃣ Admin approves order
 */
exports.approveOrder = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.adminApproval.approved || order.adminApproval.rejected) {
      return res.status(400).json({
        message: "Order already processed"
      });
    }

    order.adminApproval.approved = true;
    order.adminApproval.approvedAt = new Date();
    order.orderStatus = "CONFIRMED";

    await order.save();
    await syncTableStatus(order.tableId, "CONFIRMED");

    const payload = await buildOrderPayload(order._id);

    io.to("kitchen").emit("order_approved", payload);
    io.to("admins").emit("order_approved_admin", payload);

    res.status(200).json({
      success: true,
      message: "Order approved",
      order: payload
    });

  } catch (error) {
    res.status(500).json({ message: "Approval failed", error });
  }
};


/**
 * 4️⃣ Admin rejects order
 */
exports.rejectOrder = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.adminApproval.approved || order.adminApproval.rejected) {
      return res.status(400).json({
        message: "Order already processed"
      });
    }

    order.adminApproval.rejected = true;
    order.adminApproval.rejectedAt = new Date();
    order.rejectionReason = reason || "Rejected by admin";
    order.orderStatus = "REJECTED";

    await order.save();

    await syncTableStatus(order.tableId, "REJECTED");

    const payload = await buildOrderPayload(order._id);

    io.to("admins").emit("order_rejected_admin", payload);

    if (order.customerId) {
      io.to(`customer_${order.customerId}`).emit("order_rejected", payload);
    }

    res.status(200).json({
      success: true,
      message: "Order rejected successfully",
      order: payload
    });

  } catch (error) {
    res.status(500).json({ message: "Rejection failed", error });
  }
};


/**
 * 5️⃣ Kitchen updates order status
 */
exports.updateStatus = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { orderId, kitchenStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "REJECTED") {
      return res.status(400).json({
        message: "Rejected orders cannot be updated"
      });
    }

    order.kitchenStatus = kitchenStatus;

    await order.save();

    const payload = await buildOrderPayload(order._id);

    io.to("admins").emit("order_status_changed", payload);

    if (order.customerId) {
      io.to(`customer_${order.customerId}`).emit(
        "customer_status_update",
        payload
      );
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: payload
    });

  } catch (error) {
    res.status(500).json({ message: "Status update failed", error });
  }
};


/**
 * 6️⃣ Admin serves order
 */
exports.serveOrder = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.kitchenStatus !== "READY") {
      return res.status(400).json({
        message: "Only READY orders can be served"
      });
    }

    order.kitchenStatus = "SERVED";
order.orderStatus = "COMPLETED";
order.servedAt = new Date(); // ✅ FIX

    await order.save();

    await syncTableStatus(order.tableId, "SERVED");

    const payload = await buildOrderPayload(order._id);

    io.to("admins").emit("order_status_changed", payload);
    io.to("kitchen").emit("order_status_changed", payload);

    if (order.customerId) {
      io.to(`customer_${order.customerId}`).emit(
        "customer_status_update",
        payload
      );
    }

    res.status(200).json({
      success: true,
      message: "Order served successfully",
      order: payload
    });

  } catch (error) {
    res.status(500).json({ message: "Serve failed", error });
  }
};
