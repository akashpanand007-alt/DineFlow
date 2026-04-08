import Category from "../models/Category.js";

// Create category (Admin)
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name required" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(409).json({ success: false, message: "Category exists" });

    const category = await Category.create({ name });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete category (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const deleted = await Category.findByIdAndDelete(categoryId);
    if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
