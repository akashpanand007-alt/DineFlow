import Order from "../models/Order.js";
import Kitchen from "../models/Kitchen.js";
import Table from "../models/Table.js";
import { getActiveKitchenCount } from "../configs/socketServer.js";
import mongoose from "mongoose"; 


let io = null;
export const setDashboardSocket = (ioInstance) => {
  io = ioInstance;
};


const startOfDay = (d) => new Date(d.setHours(0, 0, 0, 0));
const endOfDay = (d) => new Date(d.setHours(23, 59, 59, 999));


const ACTIVE_ORDER_STATUSES = ["CREATED", "OTP_PENDING", "OTP_VERIFIED", "CONFIRMED"];


export const getDashboardData = async (req, res) => {
  try {
    const now = new Date();

const dailyStart = startOfDay(new Date());
const dailyEnd = endOfDay(new Date());


const weeklyStart = new Date(now);
weeklyStart.setDate(now.getDate() - now.getDay()); 
weeklyStart.setHours(0, 0, 0, 0);


const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
monthlyStart.setHours(0, 0, 0, 0);

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
  paymentStatus: o.payment?.status || "PENDING", 
  time: o.createdAt
}));


    const activeTableIds = await Order.distinct("tableId", {
  tableId: { $ne: null },
  orderStatus: { $in: ACTIVE_ORDER_STATUSES },
  "adminApproval.rejected": false
});



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


export const debugDashboardData = async (req, res) => {
  try {
    const orders = await Order.find().limit(5).lean();
    

    const allTables = await Table.find().lean();


    const tableMap = {};
    allTables.forEach(t => {
      tableMap[t._id.toString()] = t.number;
    });


    const fallbackTable = allTables[0];

    const diagnostics = orders.map(o => {
      const rawTableId = o.tableId?.toString();

      let tableNumber = rawTableId ? tableMap[rawTableId] : null;


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