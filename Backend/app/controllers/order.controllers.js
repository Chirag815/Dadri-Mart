import orderModel from "../models/order.models.js";
import inventoryModel from "../models/inventory.models.js";
import productModel from "../models/product.models.js";
import storeModel from "../models/store.models.js";
import userModel from "../models/user.models.js";

export const createOrder = async (req, res) => {
  try {
    const { storeId, items, deliveryAddressText, coordinates } = req.body;

    if (!storeId || !items || !items.length || !deliveryAddressText || !coordinates) {
      return res.status(400).json({
        success: false,
        message: "Store, items, address text, and location coordinates are required"
      });
    }

    // 1. Fetch store
    const store = await storeModel.findById(storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    // 2. Validate stock levels for all items before making any modifications
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, quantity } = item;
      if (quantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be greater than 0" });
      }

      // Find inventory
      const inventory = await inventoryModel.findOne({ store: storeId, product: productId }).populate("product");
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: `Product not found in this store's inventory`
        });
      }

      if (inventory.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${inventory.product.name}. Available: ${inventory.stock}`
        });
      }

      validatedItems.push({
        product: productId,
        quantity,
        price: inventory.product.price
      });

      subtotal += inventory.product.price * quantity;
    }

    // 3. Atomically decrement stock in database
    for (const item of validatedItems) {
      await inventoryModel.updateOne(
        { store: storeId, product: item.product },
        { $inc: { stock: -item.quantity } }
      );
    }

    const deliveryFee = subtotal > 500 ? 0 : 25; // free delivery above Rs 500
    const total = subtotal + deliveryFee;

    // 4. Create Order record
    const order = await orderModel.create({
      customer: req.user._id,
      store: storeId,
      items: validatedItems,
      subtotal,
      deliveryFee,
      total,
      status: "CONFIRMED",
      deliveryAddress: {
        text: deliveryAddressText,
        coordinates // [longitude, latitude]
      },
      paymentMethod: "CARD",
      paymentStatus: "PAID" // Automatically paid in simulation
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
      .populate("customer", "fullname username email address")
      .populate("rider", "fullname username role address");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Auth validation: only customer, rider assigned, or admin can view
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isRider = order.rider?.toString() === req.user._id.toString() || req.user.role === "rider";

    if (!isCustomer && !isAdmin && !isRider) {
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
    const { storeId } = req.query;
    const filter = {};
    if (storeId) {
      filter.store = storeId;
    }

    const orders = await orderModel.find(filter)
      .populate("store")
      .populate("items.product")
      .populate("customer", "fullname username email address")
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

    const allowedStatuses = ["CONFIRMED", "PICKING", "PACKED", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status value" });
    }

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Role verification
    if (req.user.role === "rider" && !["OUT_FOR_DELIVERY", "DELIVERED"].includes(status)) {
      return res.status(403).json({
        success: false,
        message: "Riders are only authorized to transition orders to OUT_FOR_DELIVERY or DELIVERED"
      });
    }

    // OTP verification for DELIVERED status
    if (status === "DELIVERED") {
      if (!otp) {
        return res.status(400).json({ success: false, message: "OTP is required to complete delivery" });
      }
      if (order.otp !== otp.toString().trim()) {
        return res.status(400).json({ success: false, message: "Invalid delivery OTP. Please check with customer." });
      }
      order.paymentStatus = "PAID";
    }

    // Stock replenishment if order cancelled
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await inventoryModel.updateOne(
          { store: order.store, product: item.product },
          { $inc: { stock: item.quantity } }
        );
      }
      order.paymentStatus = "REFUNDED";
    }

    order.status = status;
    order.timeline.push({ status, timestamp: new Date() });
    await order.save();

    const updatedOrder = await orderModel.findById(order._id)
      .populate("store")
      .populate("items.product")
      .populate("customer", "fullname username email address")
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
    // Available deliveries are those in 'PACKED' or 'ASSIGNED' (to me) status
    const orders = await orderModel.find({
      $or: [
        { status: "PACKED", rider: { $exists: false } },
        { rider: req.user._id }
      ]
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
    const { riderId } = req.body; // Can be assigned by admin, or accepted by current rider

    const finalRiderId = riderId || req.user._id;

    const rider = await userModel.findById(finalRiderId);
    if (!rider || rider.role !== "rider") {
      return res.status(400).json({
        success: false,
        message: "Valid rider details are required"
      });
    }

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "CANCELLED" || order.status === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign rider to completed or cancelled order"
      });
    }

    order.rider = finalRiderId;
    order.status = "ASSIGNED";
    order.timeline.push({ status: "ASSIGNED", timestamp: new Date() });
    await order.save();

    const updatedOrder = await orderModel.findById(id)
      .populate("store")
      .populate("items.product")
      .populate("customer", "fullname username email address")
      .populate("rider", "fullname username role");

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Rider successfully assigned to order"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
