import Product from "../models/product.js";

/**
 * ===============================
 * ADMIN: GET ALL PRODUCTS
 * GET /api/admin/products
 * ===============================
 */
export const adminGetProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/**
 * ===============================
 * ADMIN: ADD PRODUCT
 * POST /api/admin/products
 * ===============================
 */
export const adminAddProduct = async (req, res) => {
  try {
    const {
  name,
  description,
  category,
  basePrice,
  variants,
  dietType
} = req.body;

    if (!name || !category || !basePrice) {
      return res.status(400).json({
        success: false,
        message: "Name, category and basePrice are required",
      });
    }

    const images = (req.files || []).map((file) => ({
      url: file.path,        // Cloudinary URL
      public_id: file.filename
    }));

    const newProduct = new Product({
  name,
  description,
  category,
  basePrice,
  variants: variants ? JSON.parse(variants) : [],
  images,
  dietType: dietType || "VEG",
});

    await newProduct.save();

    // 🔔 realtime emit (optional but matches frontend socket)
    req.app.get("io")?.emit("product_created", newProduct);

    return res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * ===============================
 * ADMIN: DELETE PRODUCT
 * DELETE /api/admin/products/:productId
 * ===============================
 */
export const adminDeleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔔 realtime emit
    req.app.get("io")?.emit("product_deleted", productId);

    return res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Deletion failed",
    });
  }
};

