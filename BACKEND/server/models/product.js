import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  images: [
    {
      url: String,
      public_id: String
    }
  ],

  category: {
    type: String,
    required: true,
    index: true
  },

  basePrice: {
    type: Number,
    required: true
  },

  variants: [
    {
      name: { type: String },        
      price: { type: Number, required: true }
    }
  ],

  dietType: {
      type: String,
      enum: ["VEG", "NON_VEG"], 
      required: true,
      default: "VEG",           
    },

  
  isActive: {
    type: Boolean,
    default: true   
  },

  
  kitchenAvailability: {
    type: String,
    enum: ["AVAILABLE", "OUT_OF_STOCK", "PAUSED"],
    default: "AVAILABLE"
  },

  kitchenNote: {
    type: String    
  },

  preparationTime: {
    type: Number,
    default: 10
  }
},
{ timestamps: true }
);

const Product = mongoose.models.product || mongoose.model("Product", productSchema, "products");
export default Product;