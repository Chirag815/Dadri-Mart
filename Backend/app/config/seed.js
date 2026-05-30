import storeModel from "../models/store.models.js";
import productModel from "../models/product.models.js";
import inventoryModel from "../models/inventory.models.js";
import pincodeModel from "../models/pincode.models.js";
import settingsModel from "../models/settings.models.js";
import userModel from "../models/user.models.js";

// Demo users for development/testing
const demoUsers = [
  {
    fullname: "Store Admin",
    email: "admin@kartly.io",
    phone: "9000000001",
    pincode: "110001",
    role: "admin",
    username: "u_admin_kartly",
    address: { text: "Radial Road 3, Connaught Place, New Delhi", coordinates: [77.2197, 28.6304] }
  },
  {
    fullname: "Store Vendor",
    email: "vendor@kartly.io",
    phone: "9000000002",
    pincode: "110001",
    role: "vendor",
    username: "u_vendor_kartly",
    address: { text: "Radial Road 3, Connaught Place, New Delhi", coordinates: [77.2197, 28.6304] }
  },
  {
    fullname: "Demo Customer",
    email: "customer@kartly.io",
    phone: "9000000003",
    pincode: "110001",
    role: "user",
    username: "u_customer_demo",
    address: { text: "Kartavya Path, New Delhi, DL 110001", coordinates: [77.2295, 28.6129] }
  }
];

const storesData = [
  {
    name: "Connaught Place Dark Store",
    address: "Radial Road 3, Connaught Place, New Delhi",
    location: { type: "Point", coordinates: [77.2197, 28.6304] }, // CP Delhi
    isActive: true
  }
];

const productsData = [
  // Vegetables
  {
    name: "Fresh Tomatoes (500g)",
    description: "Farm-fresh organic red tomatoes, handpicked for quality.",
    price: 32,
    mrp: 45,
    image: "https://placehold.co/400x400/FF6B6B/FFFFFF?text=Tomatoes",
    sku: "VEG-TOMATO-500",
    category: "vegetables"
  },
  {
    name: "Organic Onions (1kg)",
    description: "Crispy and flavorful organic onions, kitchen staple.",
    price: 40,
    mrp: 60,
    image: "https://placehold.co/400x400/D0BFFF/333333?text=Onions",
    sku: "VEG-ONION-1000",
    category: "vegetables"
  },
  {
    name: "Fresh Potatoes (1kg)",
    description: "Nutritious and clean potatoes, direct from local farms.",
    price: 30,
    mrp: 38,
    image: "https://placehold.co/400x400/EAD8B1/333333?text=Potatoes",
    sku: "VEG-POTATO-1000",
    category: "vegetables"
  },
  // Fruits
  {
    name: "Organic Bananas (Pack of 6)",
    description: "Ripe, sweet, and rich in potassium. Packed hygienically.",
    price: 55,
    mrp: 70,
    image: "https://placehold.co/400x400/FFF3B0/333333?text=Bananas",
    sku: "FRU-BANANA-6",
    category: "vegetables"
  },
  // Dairy
  {
    name: "Amul Gold Milk (500ml)",
    description: "Pasteurized full cream milk, creamy and rich.",
    price: 33,
    mrp: 35,
    image: "https://placehold.co/400x400/F4F6F9/333333?text=Amul+Milk",
    sku: "DAI-MILK-500",
    category: "dairy"
  },
  {
    name: "Amul Butter Salted (100g)",
    description: "The classic salted butter from Amul. Utterly butterly delicious.",
    price: 56,
    mrp: 58,
    image: "https://placehold.co/400x400/FFE082/333333?text=Amul+Butter",
    sku: "DAI-BUTTER-100",
    category: "dairy"
  },
  {
    name: "Fresh Paneer (200g)",
    description: "Soft, fresh, and high-protein cottage cheese.",
    price: 90,
    mrp: 110,
    image: "https://placehold.co/400x400/ECEFF1/333333?text=Paneer",
    sku: "DAI-PANEER-200",
    category: "dairy"
  },
  // Bakery
  {
    name: "Whole Wheat Bread (400g)",
    description: "Soft, healthy, sliced whole wheat sandwich bread.",
    price: 45,
    mrp: 50,
    image: "https://placehold.co/400x400/D7CCC8/333333?text=Wheat+Bread",
    sku: "BAK-WHEAT-BREAD",
    category: "bakery"
  },
  {
    name: "Chocolate Chip Cookies (150g)",
    description: "Crispy cookies loaded with premium dark chocolate chips.",
    price: 80,
    mrp: 100,
    image: "https://placehold.co/400x400/8D6E63/FFFFFF?text=Cookies",
    sku: "BAK-COOKIE-CHOC",
    category: "bakery"
  },
  // Beverages
  {
    name: "Coca Cola Zero Sugar (250ml)",
    description: "Great Coke taste with zero sugar and zero calories.",
    price: 40,
    mrp: 40,
    image: "https://placehold.co/400x400/212121/FFFFFF?text=Coke+Zero",
    sku: "BEV-COKE-ZERO",
    category: "beverages"
  },
  {
    name: "Organic Green Tea (25 Bags)",
    description: "Rich in antioxidants. Refreshing green tea for overall wellness.",
    price: 135,
    mrp: 160,
    image: "https://placehold.co/400x400/C8E6C9/333333?text=Green+Tea",
    sku: "BEV-GREEN-TEA",
    category: "beverages"
  },
  // Snacks
  {
    name: "Potato Chips Classic Salted (50g)",
    description: "Crunchy, thin, and lightly salted potato chips.",
    price: 20,
    mrp: 20,
    image: "https://placehold.co/400x400/FFF9C4/333333?text=Potato+Chips",
    sku: "SNA-CHIPS-SALTED",
    category: "snacks"
  },
  {
    name: "Roasted Almonds (100g)",
    description: "Salted and dry-roasted premium California almonds.",
    price: 150,
    mrp: 180,
    image: "https://placehold.co/400x400/D7CCC8/333333?text=Almonds",
    sku: "SNA-ALMOND-ROAST",
    category: "snacks"
  },
  // Household
  {
    name: "Vim Dishwash Gel Lemon (250ml)",
    description: "Super effective lemon dishwashing liquid gel.",
    price: 55,
    mrp: 60,
    image: "https://placehold.co/400x400/FFF59D/333333?text=Vim+Gel",
    sku: "HOU-VIM-LEMON",
    category: "household"
  },
  {
    name: "Surf Excel Laundry Liquid (1L)",
    description: "Tough stain removal in machines with a pleasant scent.",
    price: 220,
    mrp: 260,
    image: "https://placehold.co/400x400/BBDEFB/333333?text=Surf+Excel",
    sku: "HOU-SURF-LAUNDRY",
    category: "household"
  }
];

const pincodesData = [
  { code: "110001" },
  { code: "110017" },
  { code: "110008" }
];

export async function seedDatabase() {
  try {
    const existingSettingsCount = await settingsModel.countDocuments();
    if (existingSettingsCount > 0) {
      console.log("Database already seeded with settings. Skipping seeder.");
      return;
    }

    console.log("Seeding Database...");

    // Clear existing data
    await storeModel.deleteMany({});
    await productModel.deleteMany({});
    await inventoryModel.deleteMany({});
    await pincodeModel.deleteMany({});
    await settingsModel.deleteMany({});

    // Seed Stores
    const seededStores = await storeModel.insertMany(storesData);
    console.log(`Successfully seeded ${seededStores.length} Dark Stores.`);

    // Seed Products
    const seededProducts = await productModel.insertMany(productsData);
    console.log(`Successfully seeded ${seededProducts.length} Catalog Products.`);

    // Seed Inventories (unlimited stock counts seeded as placeholder)
    const inventoriesToInsert = [];
    for (const store of seededStores) {
      for (const product of seededProducts) {
        inventoriesToInsert.push({
          product: product._id,
          store: store._id,
          stock: 9999, // unlimited stock context
          safetyStock: 0
        });
      }
    }
    await inventoryModel.insertMany(inventoriesToInsert);
    console.log(`Successfully seeded inventories.`);

    // Seed Pincodes
    await pincodeModel.insertMany(pincodesData);
    console.log(`Successfully seeded default allowed pincodes.`);

    // Seed Timings Settings
    await settingsModel.create({
      storeOpenTime: "08:00",
      storeCloseTime: "22:00"
    });
    console.log(`Successfully seeded default store open/close timings settings.`);

    // Seed Demo Users (skip if any already exist to avoid duplicate errors)
    const existingUserCount = await userModel.countDocuments();
    if (existingUserCount === 0) {
      await userModel.insertMany(demoUsers);
      console.log(`Successfully seeded ${demoUsers.length} demo users.`);
      console.log("  → Admin  phone: 9000000001  (use OTP login at /admin-login)");
      console.log("  → Vendor phone: 9000000002  (select Vendor on login screen)");
      console.log("  → Customer phone: 9000000003 (select Customer on login screen)");
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database: ", error);
  }
}

