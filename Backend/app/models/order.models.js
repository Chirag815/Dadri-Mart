import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 25,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "PLACED",
        "ACCEPTED",
        "PACKING",
        "READY_FOR_DELIVERY",
        "DELIVERED",
        "PAYMENT_RECEIVED",
        "CANCELLED",
      ],
      default: "PLACED",
    },
    deliveryAddress: {
      text: { type: String, required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    otp: {
      type: String,
      required: true,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    paymentMethod: {
      type: String,
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "REFUNDED"],
      default: "PENDING",
    },
    notes: {
      type: String,
      default: ""
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save to auto-push PLACED to timeline
orderSchema.pre("save", function (next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({ status: "PLACED", timestamp: new Date() });
  }
  next();
});

const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default orderModel;
