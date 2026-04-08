import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  number: { type: String, required: true },
  capacity:{type:String, required: true },
  status: {
    type: String,
    enum: ["Available", "Occupied"],
    default: "Available",
  },
  qrCodeUrl: String
}, {
  timestamps: true,
});

const Table = mongoose.models.Table || mongoose.model("Table", tableSchema);

export default Table;
