import orderModel from "../models/order.models.js";
import productModel from "../models/product.models.js";
import storeModel from "../models/store.models.js";
import userModel from "../models/user.models.js";

export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddressText, coordinates, notes } = req.body;

    if (!items || !items.length || !deliveryAddressText || !coordinates) {
      return res.status(400).json({
        success: false,
        message: "Items, address text, and location coordinates are required"
      });
    }

    // 1. Fetch default store (single store system)
    let store = await storeModel.findOne({ isActive: true });
    if (!store) {
      // Fallback: Create default store if database is empty
      store = await storeModel.create({
        name: "Connaught Place Dark Store",
        address: "Radial Road 3, Connaught Place, New Delhi",
        location: { type: "Point", coordinates: [77.2197, 28.6304] },
        isActive: true
      });
    }

    // 2. Validate items and catalog prices (Stock quantity checks disabled by business requirement)
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, quantity } = item;
      if (quantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
      }

      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`
        });
      }

      validatedItems.push({
        product: productId,
        quantity,
        price: product.price
      });

      subtotal += product.price * quantity;
    }

    const deliveryFee = subtotal > 500 ? 0 : 25; // free delivery above Rs 500
    const total = subtotal + deliveryFee;

    // 3. Create Order record (paymentMethod defaults to COD, paymentStatus defaults to PENDING)
    const order = await orderModel.create({
      customer: req.user._id,
      store: store._id,
      items: validatedItems,
      subtotal,
      deliveryFee,
      total,
      status: "PLACED",
      deliveryAddress: {
        text: deliveryAddressText,
        coordinates // [longitude, latitude]
      },
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      notes: notes || ""
    });

    const populatedOrder = await orderModel.findById(order._id)
      .populate("store")
      .populate("items.product");

    return res.status(201).json({
      success: true,
      data: populatedOrder,
      message: "Order placed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ customer: req.user._id })
      .populate("store")
      .populate("items.product")
      .populate("rider", "fullname username role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
      message: "Customer orders fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id)
      .populate("store")
      .populate("items.product")
      .populate("customer", "fullname username email address phone")
      .populate("rider", "fullname username role address");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isAdminOrVendor = ["admin", "vendor"].includes(req.user.role) || req.user.role === "admin"; // compatibility

    if (!isCustomer && !isAdminOrVendor) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view this order"
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
      message: "Order fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const getStoreOrders = async (req, res) => {
  try {
    // Return all orders for store admin / vendors
    const orders = await orderModel.find({})
      .populate("store")
      .populate("items.product")
      .populate("customer", "fullname username email address phone pincode")
      .populate("rider", "fullname username role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, otp } = req.body;
    const { id } = req.params;

    const allowedStatuses = [
      "PLACED",
      "ACCEPTED",
      "PACKING",
      "READY_FOR_DELIVERY",
      "DELIVERED",
      "PAYMENT_RECEIVED",
      "CANCELLED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status value" });
    }

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Status verification for DELIVERED OTP
    if (status === "DELIVERED" && order.status !== "DELIVERED") {
      if (otp && order.otp !== otp.toString().trim()) {
        return res.status(400).json({ success: false, message: "Invalid delivery OTP. Please verify code with customer." });
      }
    }

    if (status === "PAYMENT_RECEIVED") {
      order.paymentStatus = "PAID";
    }

    if (status === "CANCELLED") {
      order.paymentStatus = "REFUNDED";
    }

    order.status = status;
    order.timeline.push({ status, timestamp: new Date() });
    await order.save();

    const updatedOrder = await orderModel.findById(order._id)
      .populate("store")
      .populate("items.product")
      .populate("customer", "fullname username email address phone")
      .populate("rider", "fullname username role");

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: `Order status successfully transitioned to ${status}`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const getAvailableDeliveries = async (req, res) => {
  try {
    // Retrofitted to return orders ready for delivery in Vendor scope
    const orders = await orderModel.find({
      status: { $in: ["READY_FOR_DELIVERY", "PACKED"] }
    })
      .populate("store")
      .populate("items.product")
      .populate("customer", "fullname username address")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const acceptOrAssignRider = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = "ACCEPTED";
    order.timeline.push({ status: "ACCEPTED", timestamp: new Date() });
    await order.save();

    const updatedOrder = await orderModel.findById(id)
      .populate("store")
      .populate("items.product")
      .populate("customer", "fullname username email address");

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Order accepted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
