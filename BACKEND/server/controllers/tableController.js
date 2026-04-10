import Table from "../models/Table.js";
import QRCode from "qrcode";

/**
 * Generate a QR Code image (base64)
 * @param {string} data - The text/URL to encode
 * @returns {Promise<string>} - Base64 encoded image string
 */
const generateQr = async (data) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data);
    return qrDataUrl;
  } catch (error) {
    throw new Error("QR generation failed");
  }
};

/**
 * Admin: Create a table and generate its QR code
 * POST /api/admin/tables
 */
export const createTable = async (req, res) => {
  try {
    const { number, capacity } = req.body;

    if (!number) {
      return res
        .status(400)
        .json({ success: false, message: "Table number is required" });
    }

    const newTable = new Table({
      number,
      capacity,
      status: "Available", // default status
    });

    // Save first to get _id
    await newTable.save();

    // Construct the URL that the QR code will point to
    // This should be a route in your frontend that leads to ordering page
    const tableUrl = `${process.env.CLIENT_ORIGIN}/order?tableId=${newTable._id}`;

    // Generate QR code (Base64)
    const qrCodeBase64 = await generateQr(tableUrl);

    // Save the QR code data on the table
    newTable.qrCodeUrl = qrCodeBase64;
    await newTable.save();

    res.status(201).json({
      success: true,
      table: newTable,
      message: "Table created with QR code",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Could not create table" });
  }
};

/**
 * Toggle Table Availability and send Socket.IO event
 * POST /api/admin/tables/toggle
 */
export const toggleTableStatus = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { tableId, status } = req.body;

    const updatedTable = await Table.findByIdAndUpdate(
      tableId,
      { status },
      { new: true }
    );

    if (!updatedTable) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }

    // Emit live update
    io.to("admins").emit("table_map_update", updatedTable);

    res.status(200).json({
      success: true,
      table: updatedTable,
      message: "Table status updated",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Status toggle failed" });
  }
};

