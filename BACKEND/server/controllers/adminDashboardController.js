import Order from "../models/Order.js";
import Kitchen from "../models/Kitchen.js";
import Table from "../models/Table.js";
import { getActiveKitchenCount } from "../configs/socketServer.js";
import mongoose from "mongoose"; // ✅ Needed for strict ID validation

// Socket reference
let io = null;
export const setDashboardSocket = (ioInstance) => {
  io = ioInstance;
};

// Helpers
const startOfDay = (d) => new Date(d.setHours(0, 0, 0, 0));
const endOfDay = (d) => new Date(d.setHours(23, 59, 59, 999));

// ✅ INCLUDE OTP_VERIFIED so tables appear after OTP
const ACTIVE_ORDER_STATUSES = ["CREATED", "OTP_PENDING", "OTP_VERIFIED", "CONFIRMED"];

// GET /api/admin/dashboard
export const getDashboardData = async (req, res) => {
  try {
    const now = new Date();
    // TODAY
const dailyStart = startOfDay(new Date());
const dailyEnd = endOfDay(new Date());

    // WEEK
const weeklyStart = new Date(now);
weeklyStart.setDate(now.getDate() - now.getDay()); // Sunday start
weeklyStart.setHours(0, 0, 0, 0);

// MONTH
const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
monthlyStart.setHours(0, 0, 0, 0);

// YEAR
const yearlyStart = new Date(now.getFullYear(), 0, 1);
yearlyStart.setHours(0, 0, 0, 0);

    const safeDateStage = {
      $addFields: {
        safeCreatedAt: {
          $cond: {
            if: { $gt: ["$createdAt", null] },
            then: "$createdAt",
            else: new Date()
          }
        }
      }
    };

    // ===== Analytics =====
const dailyStats = await Order.aggregate([
  {
    $match: {
      orderStatus: "COMPLETED",
      createdAt: { $gte: dailyStart, $lte: dailyEnd }
    }
  },
  {
    $group: {
      _id: null,
      totalOrders: { $sum: 1 },
      totalEarnings: { $sum: "$totalAmount" }
    }
  }
]);

    const weeklyStats = await Order.aggregate([
  {
    $match: {
      orderStatus: "COMPLETED",
      createdAt: { $gte: weeklyStart, $lte: dailyEnd }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
      },
      totalOrders: { $sum: 1 },
      totalEarnings: { $sum: "$totalAmount" }
    }
  },
  { $sort: { _id: 1 } }
]);

    const monthlyStats = await Order.aggregate([
  {
    $match: {
      orderStatus: "COMPLETED",
      createdAt: { $gte: monthlyStart, $lte: dailyEnd }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
      },
      totalOrders: { $sum: 1 },
      totalEarnings: { $sum: "$totalAmount" }
    }
  },
  { $sort: { _id: 1 } }
]);

    const yearlyStats = await Order.aggregate([
      {
  $match: {
    orderStatus: "COMPLETED",
    createdAt: { $gte: yearlyStart, $lte: dailyEnd }
  }
},
      safeDateStage,
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$safeCreatedAt" } },
          totalOrders: { $sum: 1 },
          totalEarnings: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // ===== Kitchen counts =====
    const approvedKitchens = await Kitchen.countDocuments({ status: "approved" });
    const pendingKitchens = await Kitchen.countDocuments({ status: "pending" });
    const rejectedKitchens = await Kitchen.countDocuments({ status: "rejected" });

    const activeKitchens = getActiveKitchenCount();

    // ===== Order counts =====
    const cancelledOrders = await Order.countDocuments({
  orderStatus: { $in: ["CANCELLED", "REJECTED"] }
});

const rejectedOrders = await Order.countDocuments({ orderStatus: "REJECTED" });
    // ===== LIVE ORDERS =====
    const liveOrders = await Order.countDocuments({
      orderStatus: { $in: ACTIVE_ORDER_STATUSES },
      "adminApproval.rejected": false
    });

    // ===== OCCUPIED TABLES =====
    const occupiedTables = await Table.countDocuments({
  status: "Occupied"
});

    // ===== Recent Orders =====
const recentOrdersRaw = await Order.find()
  .sort({ createdAt: -1 })
  .limit(5)
  .populate("tableId", "number")
  .select("customerName totalAmount orderStatus kitchenStatus tableId createdAt payment");

const recentOrders = recentOrdersRaw.map((o) => ({
  _id: o._id,
  customer: o.customerName,
  table: o.tableId ? `Table ${o.tableId.number}` : "—",
  amount: o.totalAmount,
  status: o.orderStatus,
  kitchenStatus: o.kitchenStatus,
  paymentStatus: o.payment?.status || "PENDING", // ✅ ADD THIS
  time: o.createdAt
}));

    // ===== Recent Tables =====
    // 1. Get IDs of tables with active orders
    const activeTableIds = await Order.distinct("tableId", {
  tableId: { $ne: null },
  orderStatus: { $in: ACTIVE_ORDER_STATUSES },
  "adminApproval.rejected": false
});

    // 2. Fetch those tables directly
    // ===== Recent Tables =====
const recentTablesRaw = await Table.find({
  status: "Occupied"
})
.sort({ updatedAt: -1 })
.limit(5)
.select("number status");

const recentTables = recentTablesRaw.map(t => ({
  _id: t._id,
  number: t.number,
  status: t.status
}));

    const responseData = {
      success: true,
      daily: dailyStats[0] || { totalOrders: 0, totalEarnings: 0 },
      weekly: weeklyStats,
      monthly: monthlyStats,
      yearly: yearlyStats,
      activeKitchens,
      liveOrders,
      todaysEarnings: dailyStats[0]?.totalEarnings || 0,
      approvedKitchens,
      rejectedOrders,
      pendingKitchens,
      cancelledOrders,
      occupiedTables,
      recentOrders,
      recentTables
    };

    if (io) {
      io.emit("dashboard:update", responseData);
    }

    return res.json(responseData);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data"
    });
  }
};

// TEMPORARY DEBUG ROUTE (Keep for now if needed)
export const debugDashboardData = async (req, res) => {
  try {
    const orders = await Order.find().limit(5).lean();
    
    // 1. Fetch ALL tables
    const allTables = await Table.find().lean();

    // 2. Create a map for fast lookup: ID -> Number
    const tableMap = {};
    allTables.forEach(t => {
      tableMap[t._id.toString()] = t.number;
    });

    // 3. Find a "Fallback" table (just in case the order's link is broken)
    // We will use the first table found (e.g., T4)
    const fallbackTable = allTables[0];

    const diagnostics = orders.map(o => {
      const rawTableId = o.tableId?.toString();
      
      // Check if the specific ID exists in our map
      let tableNumber = rawTableId ? tableMap[rawTableId] : null;

      // If NOT found (broken link), use the Fallback table number
      if (!tableNumber && fallbackTable) {
        tableNumber = fallbackTable.number;
      }

      return {
        orderId: o._id,
        orderStatus: o.orderStatus,
        tableId: tableNumber || "Unknown Table",
        tableIdType: tableNumber ? "string" : "object",
        rejected: o.adminApproval?.rejected
      };
    });

    res.json({
      success: true,
      activeStatusList: ACTIVE_ORDER_STATUSES,
      count: orders.length,
      orders: diagnostics
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};