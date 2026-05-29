import storeModel from "../models/store.models.js";
import productModel from "../models/product.models.js";
import inventoryModel from "../models/inventory.models.js";

export const getNearestStore = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Longitude and latitude coordinates are required"
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    // Find the nearest active store
    const nearestStore = await storeModel.findOne({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          }
        }
      }
    });

    if (!nearestStore) {
      return res.status(404).json({
        success: false,
        message: "No stores found in your area"
      });
    }

    return res.status(200).json({
      success: true,
      data: nearestStore,
      message: "Nearest store found successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const getStoreCatalog = async (req, res) => {
  try {
    const { storeId } = req.query;
    const { category, search } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required"
      });
    }

    // Populate the product details
    const inventories = await inventoryModel.find({ store: storeId }).populate("product");

    // Filter populated results
    let results = inventories.filter((item) => item.product !== null);

    if (category) {
      results = results.filter(
        (item) => item.product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (item) =>
          item.product.name.toLowerCase().includes(term) ||
          item.product.description?.toLowerCase().includes(term)
      );
    }

    // Map to a clean API response
    const catalog = results.map((item) => ({
      _id: item.product._id,
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      mrp: item.product.mrp,
      image: item.product.image,
      sku: item.product.sku,
      category: item.product.category,
      stock: item.stock,
      safetyStock: item.safetyStock,
      inventoryId: item._id
    }));

    return res.status(200).json({
      success: true,
      data: catalog,
      message: "Store catalog retrieved successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const updateInventoryStock = async (req, res) => {
  try {
    const { storeId, productId, stock } = req.body;

    if (!storeId || !productId || stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Store ID, Product ID, and valid stock count are required"
      });
    }

    const inventory = await inventoryModel.findOneAndUpdate(
      { store: storeId, product: productId },
      { $set: { stock } },
      { new: true, upsert: true }
    ).populate("product");

    return res.status(200).json({
      success: true,
      data: inventory,
      message: "Inventory stock updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const getStores = async (req, res) => {
  try {
    const stores = await storeModel.find({});
    return res.status(200).json({
      success: true,
      data: stores
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
