import mongoose, { Schema } from "mongoose";

const storeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Store address is required"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Geo-spatial index for $near queries
storeSchema.index({ location: "2dsphere" });

const storeModel = mongoose.models.Store || mongoose.model("Store", storeSchema);

export default storeModel;
