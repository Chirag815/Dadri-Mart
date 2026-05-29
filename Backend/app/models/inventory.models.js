import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    safetyStock: {
      type: Number,
      default: 2,
      min: [0, "Safety stock cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of product per store
inventorySchema.index({ store: 1, product: 1 }, { unique: true });

const inventoryModel = mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);

export default inventoryModel;
