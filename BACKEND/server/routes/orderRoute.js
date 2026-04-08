import express from "express";
import Order from "../models/Order.js";
import Table from "../models/Table.js";

// ✅ helper: keep table status in sync with order
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

export default function orderRoutes(io) {
  const router = express.Router();

  /**
   * ===============================
   * 1️⃣ Customer places an order
   * ===============================
   */
  const createOrderHandler = async (req, res, next) => {
    try {
      const {
        tableId,
        customerName,
        customerEmail,
        items,
        totalAmount,
        payment
      } = req.body;

      if (
        !tableId ||
        !customerName ||
        !customerEmail ||
        !Array.isArray(items) ||
        items.length === 0 ||
        typeof totalAmount !== "number" ||
        !payment ||
        !payment.method
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid order data" });
      }

      const newOrder = await Order.create({
        tableId,
        customerName,
        customerEmail,
        items,
        totalAmount,
        payment: {method: payment.method,status: payment.method === "PAY_LATER" ? "PENDING" : "PENDING"},
        adminApproval: {
          approved: false,
          rejected: false
        },
        kitchenStatus: "WAITING",
        orderStatus: "OTP_PENDING"
      });

      await syncTableStatus(newOrder.tableId, "OTP_PENDING");

      const populatedOrder = await Order.findById(newOrder._id).populate("tableId", "number");


      // 🔔 notify customer tracker
      const email = newOrder.customerEmail?.trim().toLowerCase();
io.emit(`customer_status_update_${email}`, populatedOrder);


      return res.status(201).json({ success: true, order: populatedOrder });
    } catch (error) {
      return next(error);
    }
  };

  router.post("/", createOrderHandler);
  router.post("/create", createOrderHandler);

  /**
   * ===============================
   * 2️⃣ Get all orders (Admin)
   * ===============================
   */
  router.get("/", async (req, res, next) => {
    try {
      const orders = await Order.find()
        .populate("tableId", "number")
        .sort({ createdAt: -1 });

      return res.json({ success: true, orders });
    } catch (error) {
      return next(error);
    }
  });
  
  /**
   * ===============================
   * 3️⃣ Get single order
   * ===============================
   */
  router.get("/:orderId", async (req, res, next) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId).populate("tableId", "number");

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      return res.json({ success: true, order });
    } catch (error) {
      return next(error);
    }
  });

  /**
 * ===============================
 * Set payment method
 * ===============================
 */
router.post("/set-payment", async (req, res, next) => {
  try {
    const { orderId, method } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.payment.method = method;

    if (method === "PAY_LATER") {
      order.orderStatus = "CONFIRMED";
      await syncTableStatus(order.tableId, "CONFIRMED");
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("tableId", "number");

    // send live order to admin + kitchen
    io.to("admins").emit("new_order_alert", populatedOrder);

    res.json({
      success: true,
      order: populatedOrder
    });

  } catch (error) {
    next(error);
  }
});

  /**
   * ===============================
   * 4️⃣ Admin approves order
   * ===============================
   */
  router.post("/approve", async (req, res, next) => {
    try {
      const { orderId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      if (order.adminApproval.approved || order.adminApproval.rejected) {
        return res
          .status(400)
          .json({ success: false, message: "Order already processed" });
      }

      order.adminApproval.approved = true;
      order.adminApproval.rejected = false;
      order.adminApproval.approvedAt = new Date();
      order.orderStatus = "CONFIRMED";

      await order.save();
      await syncTableStatus(order.tableId, "CONFIRMED");

      const populatedOrder = await Order.findById(order._id).populate("tableId", "number");

      io.to("kitchen").emit("order_approved", populatedOrder);
      io.to("admins").emit("order_approved_admin", populatedOrder);
      const email = order.customerEmail?.trim().toLowerCase();
io.emit(`customer_status_update_${email}`, populatedOrder);

      return res.json({ success: true, order: populatedOrder });
    } catch (error) {
      return next(error);
    }
  });

  // ===============================
// 💳 Admin marks PAY_LATER as PAID
// ===============================
router.patch("/mark-paid/:orderId", async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Only update if not already paid
    if (order.payment.status !== "PAID") {
      order.payment.status = "PAID";
      order.payment.paidAt = new Date();
      await order.save();
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("tableId", "number");

    // 🔔 notify admin dashboards
    io.to("admins").emit("payment_updated", populatedOrder);

    res.json({
      success: true,
      order: populatedOrder
    });

  } catch (error) {
    next(error);
  }
});

  /**
 * ===============================
 * 💳 Payment success (Online)
 * ===============================
 */
router.post("/payment-success", async (req, res, next) => {
  try {
    const { orderId, transactionId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.payment.method !== "PAY_ONLINE") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    order.payment.status = "PAID";
    order.payment.transactionId = transactionId || null;
    order.payment.paidAt = new Date();

    order.orderStatus = "CONFIRMED";
    await syncTableStatus(order.tableId, "CONFIRMED");

    await order.save();

    const populatedOrder = await Order.findById(order._id).populate("tableId", "number");

    // Notify admin that a new paid order is ready
    io.to("admins").emit("new_order_alert", populatedOrder);

    const email = order.customerEmail?.trim().toLowerCase();
io.emit(`customer_status_update_${email}`, populatedOrder);

    return res.json({ success: true, order: populatedOrder });

  } catch (error) {
    return next(error);
  }
});

  /**
   * ===============================
   * 5️⃣ Admin rejects order
   * ===============================
   */
  router.post("/reject", async (req, res, next) => {
    try {
      const { orderId, reason } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      if (order.adminApproval.approved || order.adminApproval.rejected) {
        return res
          .status(400)
          .json({ success: false, message: "Order already processed" });
      }

      order.adminApproval.rejected = true;
      order.adminApproval.approved = false;
      order.adminApproval.rejectedAt = new Date();
      order.rejectionReason = reason || "Rejected by admin";
      order.orderStatus = "REJECTED";

      await order.save();
      await syncTableStatus(order.tableId, "REJECTED");

      const populatedOrder = await Order.findById(order._id).populate("tableId", "number");

      io.to("admins").emit("order_rejected_admin", populatedOrder);
      const email = order.customerEmail?.trim().toLowerCase();
io.emit(`customer_status_update_${email}`, populatedOrder);

      return res.json({ success: true, order: populatedOrder });
    } catch (error) {
      return next(error);
    }
  });

  /**
   * ===============================
   * 6️⃣ Update order status (Kitchen)
   * ===============================
   */
  router.put("/:orderId/status", async (req, res) => {
  try {
    const io = req.app.get("io");
    const { orderId } = req.params;
    const { kitchenStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "REJECTED") {
      return res.status(400).json({
        message: "Rejected orders cannot be updated",
      });
    }

    order.kitchenStatus = kitchenStatus;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("tableId", "number");

    // 🔔 existing emits
    io.to("kitchen").emit("order_status_changed", populatedOrder);
    io.to("admins").emit("order_status_changed", populatedOrder);

    // ✅🔥 ADD THIS (CRITICAL FIX)
    const email = order.customerEmail?.trim().toLowerCase();
io.emit(`customer_status_update_${email}`, populatedOrder);

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: populatedOrder,
    });

  } catch (error) {
    res.status(500).json({
      message: "Status update failed",
      error,
    });
  }
});

  /**
   * ===============================
   * 9️⃣ Admin serves order
   * ===============================
   */
  router.post("/serve", async (req, res, next) => {
    try {
      const { orderId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      if (order.kitchenStatus !== "READY") {
        return res.status(400).json({
          success: false,
          message: "Only READY orders can be served"
        });
      }

      order.kitchenStatus = "SERVED";
order.orderStatus = "SERVED"; // 👈 NEW STATE
order.servedAt = new Date();

      await order.save();
      await syncTableStatus(order.tableId, "SERVED");

      const populatedOrder = await Order.findById(order._id).populate("tableId", "number");

      io.to("kitchen").emit("order_status_changed", populatedOrder);
      io.to("admins").emit("order_served_admin", populatedOrder);
      const email = order.customerEmail?.trim().toLowerCase();
io.emit(`customer_status_update_${email}`, populatedOrder);

      return res.json({ success: true, order: populatedOrder });
    } catch (error) {
      return next(error);
    }
  });

  /**
   * ===============================
   * 7️⃣ Kitchen active orders
   * ===============================
   */
  router.get("/kitchen/active", async (req, res, next) => {
    try {
      const orders = await Order.find({
        orderStatus: "CONFIRMED"
      })
        .populate("tableId", "number")
        .sort({ createdAt: -1 });

      const mapped = orders.map(o => ({
        id: o._id,
        table: o.tableId?.number || "",
        status: o.kitchenStatus,
        paymentMethod: o.payment?.method,
        instructions: o.instructions || "",
        items: o.items
      }));

      return res.json({ orders: mapped });
    } catch (error) {
      return next(error);
    }
  });


  /**
 * ===============================
 * ✅ Admin marks order as COMPLETED
 * ===============================
 */
router.post("/complete", async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Only served orders can be completed
    if (order.kitchenStatus !== "SERVED") {
      return res.status(400).json({
        success: false,
        message: "Only SERVED orders can be completed"
      });
    }

    order.orderStatus = "COMPLETED";
    order.completedAt = new Date();

    await order.save();
    await syncTableStatus(order.tableId, "COMPLETED");

    const populatedOrder = await Order.findById(order._id)
      .populate("tableId", "number");

    io.to("admins").emit("order_completed", populatedOrder);

    res.json({
      success: true,
      order: populatedOrder
    });

  } catch (error) {
    next(error);
  }
});

  /**
   * ===============================
   * 8️⃣ Kitchen history orders
   * ===============================
   */
  router.get("/kitchen/history", async (req, res, next) => {
    try {
      const orders = await Order.find({
        orderStatus: "COMPLETED"
      })
        .populate("tableId", "number")
        .sort({ updatedAt: -1 })
        .limit(50);

      const mapped = orders.map(o => ({
        id: o._id,
        table: o.tableId?.number || "",
        items: o.items
      }));

      return res.json({ orders: mapped });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
