import Product from "../models/product.js";

/**
 * Get List of Products (Public)
 * Supports optional category filtering, e.g.:
 * GET /api/products/list?category=Starters
 */
export const productList = async (req, res) => {
  try {
    const { category } = req.query;

    
    const filter = { isActive: true };

    
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter);

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Single Product by ID (Public)
 * GET /api/products/id/:productId
 */
export const productById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
