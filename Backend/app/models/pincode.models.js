import mongoose, { Schema } from "mongoose";

const pincodeSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Pincode is required"],
      unique: true,
      trim: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const pincodeModel = mongoose.models.Pincode || mongoose.model("Pincode", pincodeSchema);

export default pincodeModel;
