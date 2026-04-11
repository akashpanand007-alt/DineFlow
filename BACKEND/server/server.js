import dns from "node:dns";
// Force Node.js to use Google DNS to resolve the MongoDB SRV record
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

// Routes
import userRouter from "./routes/userRoute.js";
import kitchenRouter from "./routes/kitchenRoute.js";
import adminKitchenRoutes from "./routes/adminKitchenRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import tableRoutes from "./routes/tableRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import adminDashboardRoutes from "./routes/adminDashboardRoute.js";
import adminRoute from "./routes/adminRoute.js";
import adminCategoryRoute from "./routes/adminCategoryRoute.js";
import kitchenProductRoute from "./routes/kitchenProductRoute.js";
import otpRoutes from "./routes/otpRoute.js";
import webhookRoutes from "./routes/webhookRoute.js";
import adminProductRoute from "./routes/adminProductRoute.js";

import { Server } from "socket.io";
import { initSocketServer } from "./configs/socketServer.js";


const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT||4000;

// Create HTTP server
const server = http.createServer(app);

// Allowed frontend origin
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://dine-flow-one.vercel.app",
    ],
    credentials: true,
  },
});


app.set("io", io);

// Socket connection
initSocketServer(io);

// DB + Cloudinary
await connectDB();
await connectCloudinary();

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://dine-flow-one.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Webhooks 
app.use("/api/webhook", webhookRoutes);

// Body parsers
app.use(express.json());
app.use(cookieParser());

// Health routes
app.get("/", (req, res) => res.send("API is working"));
app.get("/api/ping", (req, res) => res.json({ success: true }));

// API routes
app.use("/api/user", userRouter);
app.use("/api/kitchen", kitchenRouter);
app.use("/api/admin/kitchens", adminKitchenRoutes);
app.use("/api/admin/products", adminProductRoute);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);

// orders receive io directly
app.use("/api/orders", orderRoutes(io));

app.use("/api/admin/tables", tableRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/admin/categories", adminCategoryRoute);
app.use("/api/kitchen/products", kitchenProductRoute);
app.use("/api/otp", otpRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

// Start server
server.listen(port, () => {
});