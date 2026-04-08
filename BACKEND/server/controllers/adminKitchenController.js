import Kitchen from "../models/Kitchen.js";

// 1) List pending kitchens
export const getPendingKitchens = async (req, res) => {
  try {
    const kitchens = await Kitchen.find({ status: "pending" });
    res.json({ success: true, kitchens });
  } catch (error) {

    res.status(500).json({ success: false, message: "Failed to fetch pending kitchens" });
  }
};

// 2) Approve kitchen
export const approveKitchen = async (req, res) => {
  try {
    const { kitchenId } = req.body;
    const kitchen = await Kitchen.findById(kitchenId);
    if (!kitchen)
      return res.status(404).json({ success: false, message: "Kitchen not found" });

    kitchen.status = "approved";
    await kitchen.save();

    res.json({ success: true, message: "Kitchen approved", kitchen });
  } catch (error) {
    res.status(500).json({ success: false, message: "Approval failed" });
  }
};

// 3) Reject kitchen
export const rejectKitchen = async (req, res) => {
  try {
    const { kitchenId } = req.body;
    const kitchen = await Kitchen.findById(kitchenId);
    if (!kitchen)
      return res.status(404).json({ success: false, message: "Kitchen not found" });

    kitchen.status = "rejected";
    await kitchen.save();

    res.json({ success: true, message: "Kitchen rejected" });
  } catch (error) {

    res.status(500).json({ success: false, message: "Rejection failed" });
  }
};

// controllers/adminKitchenController.js

// existing functions...

export const deactivateKitchen = async (req, res) => {
  try {
    const { kitchenId } = req.body;
    const kitchen = await Kitchen.findById(kitchenId);
    if (!kitchen)
      return res.status(404).json({ success: false, message: "Kitchen not found" });

    kitchen.status = "deactivated";
    await kitchen.save();

    res.json({ success: true, message: "Kitchen account deactivated", kitchen });
  } catch (error) {

    res.status(500).json({ success: false, message: "Termination failed" });
  }
};

export const deleteKitchen = async (req, res) => {
  try {
    const { kitchenId } = req.body;
    const kitchen = await Kitchen.findByIdAndDelete(kitchenId);
    if (!kitchen)
      return res.status(404).json({ success: false, message: "Kitchen not found" });

    res.json({ success: true, message: "Kitchen account permanently deleted" });
  } catch (error) {

    res.status(500).json({ success: false, message: "Delete failed" });
  }
};