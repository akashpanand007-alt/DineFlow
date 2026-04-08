import Product from "../models/product.js";

export const updateKitchenStock = async (req, res) => {
  try {
    const { productId, kitchenAvailability, kitchenNote } = req.body;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (kitchenAvailability) product.kitchenAvailability = kitchenAvailability;
    if (kitchenNote) product.kitchenNote = kitchenNote;

    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};
