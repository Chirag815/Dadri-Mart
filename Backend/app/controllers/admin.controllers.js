import pincodeModel from "../models/pincode.models.js";
import settingsModel from "../models/settings.models.js";
import orderModel from "../models/order.models.js";

// Pincode Management
export const getPincodes = async (req, res) => {
  try {
    const pincodes = await pincodeModel.find({}).sort({ code: 1 });
    return res.status(200).json({ success: true, data: pincodes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addPincode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Pincode code is required" });
    }

    const existed = await pincodeModel.findOne({ code: code.trim() });
    if (existed) {
      return res.status(400).json({ success: false, message: "Pincode already exists" });
    }

    const pincode = await pincodeModel.create({ code: code.trim() });
    return res.status(201).json({ success: true, data: pincode, message: "Pincode added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removePincode = async (req, res) => {
  try {
    const { id } = req.params;
    await pincodeModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Pincode removed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkPincodeAvailable = async (req, res) => {
  try {
    const { pincode } = req.query;
    if (!pincode) {
      return res.status(400).json({ success: false, message: "Pincode query is required" });
    }
    const found = await pincodeModel.findOne({ code: pincode.trim(), isActive: true });
    return res.status(200).json({ success: true, available: !!found });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Store Timing settings
export const getSettings = async (req, res) => {
  try {
    let settings = await settingsModel.findOne({});
    if (!settings) {
      // Seed default settings
      settings = await settingsModel.create({
        storeOpenTime: "08:00",
        storeCloseTime: "22:00"
      });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { storeOpenTime, storeCloseTime } = req.body;
    
    let settings = await settingsModel.findOne({});
    if (!settings) {
      settings = new settingsModel();
    }

    if (storeOpenTime) settings.storeOpenTime = storeOpenTime;
    if (storeCloseTime) settings.storeCloseTime = storeCloseTime;
    
    await settings.save();
    return res.status(200).json({ success: true, data: settings, message: "Store timings updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Analytics (Today's Orders, Today's Revenue, Pending, Delivered)
export const getAnalytics = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Queries
    const todayOrdersCount = await orderModel.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    const todayOrders = await orderModel.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: "CANCELLED" }
    });
    const todayRevenueSum = todayOrders.reduce((sum, order) => sum + order.total, 0);

    const pendingOrdersCount = await orderModel.countDocuments({
      status: { $in: ["PLACED", "ACCEPTED", "PACKING", "READY_FOR_DELIVERY"] }
    });

    const deliveredOrdersCount = await orderModel.countDocuments({
      status: { $in: ["DELIVERED", "PAYMENT_RECEIVED"] }
    });

    return res.status(200).json({
      success: true,
      data: {
        todayOrders: todayOrdersCount,
        todayRevenue: todayRevenueSum,
        pendingOrders: pendingOrdersCount,
        deliveredOrders: deliveredOrdersCount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
