import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema(
  {
    storeOpenTime: {
      type: String,
      default: "08:00", // "HH:MM" format
      trim: true
    },
    storeCloseTime: {
      type: String,
      default: "22:00", // "HH:MM" format
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const settingsModel = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default settingsModel;
