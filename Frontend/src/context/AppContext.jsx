import React, { createContext, useState, useEffect } from "react";
import api from "../lib/api";

// Fallback Mock Data for Simulation Mode
export const MOCK_PRODUCTS = [
  { _id: "p1", name: "Fresh Tomatoes (500g)", description: "Farm-fresh organic red tomatoes, handpicked for quality.", price: 32, mrp: 45, image: "https://placehold.co/400x400/FF6B6B/FFFFFF?text=Tomatoes", sku: "VEG-TOMATO-500", category: "vegetables", stock: 25 },
  { _id: "p2", name: "Organic Onions (1kg)", description: "Crispy and flavorful organic onions, kitchen staple.", price: 40, mrp: 60, image: "https://placehold.co/400x400/D0BFFF/333333?text=Onions", sku: "VEG-ONION-1000", category: "vegetables", stock: 18 },
  { _id: "p3", name: "Fresh Potatoes (1kg)", description: "Nutritious and clean potatoes, direct from local farms.", price: 30, mrp: 38, image: "https://placehold.co/400x400/EAD8B1/333333?text=Potatoes", sku: "VEG-POTATO-1000", category: "vegetables", stock: 35 },
  { _id: "p4", name: "Organic Bananas (Pack of 6)", description: "Ripe, sweet, and rich in potassium. Packed hygienically.", price: 55, mrp: 70, image: "https://placehold.co/400x400/FFF3B0/333333?text=Bananas", sku: "FRU-BANANA-6", category: "vegetables", stock: 12 },
  { _id: "p5", name: "Amul Gold Milk (500ml)", description: "Pasteurized pasteurized full cream milk, creamy and rich.", price: 33, mrp: 35, image: "https://placehold.co/400x400/F4F6F9/333333?text=Amul+Milk", sku: "DAI-MILK-500", category: "dairy", stock: 40 },
  { _id: "p6", name: "Amul Butter Salted (100g)", description: "The classic salted butter from Amul. Utterly butterly delicious.", price: 56, mrp: 58, image: "https://placehold.co/400x400/FFE082/333333?text=Amul+Butter", sku: "DAI-BUTTER-100", category: "dairy", stock: 15 },
  { _id: "p7", name: "Fresh Paneer (200g)", description: "Soft, fresh, and high-protein cottage cheese.", price: 90, mrp: 110, image: "https://placehold.co/400x400/ECEFF1/333333?text=Paneer", sku: "DAI-PANEER-200", category: "dairy", stock: 22 },
  { _id: "p8", name: "Whole Wheat Bread (400g)", description: "Soft, healthy, sliced whole wheat sandwich bread.", price: 45, mrp: 50, image: "https://placehold.co/400x400/D7CCC8/333333?text=Wheat+Bread", sku: "BAK-WHEAT-BREAD", category: "bakery", stock: 8 },
  { _id: "p9", name: "Chocolate Chip Cookies (150g)", description: "Crispy cookies loaded with premium dark chocolate chips.", price: 80, mrp: 100, image: "https://placehold.co/400x400/8D6E63/FFFFFF?text=Cookies", sku: "BAK-COOKIE-CHOC", category: "bakery", stock: 14 },
  { _id: "p10", name: "Coca Cola Zero Sugar (250ml)", description: "Great Coke taste with zero sugar and zero calories.", price: 40, mrp: 40, image: "https://placehold.co/400x400/212121/FFFFFF?text=Coke+Zero", sku: "BEV-COKE-ZERO", category: "beverages", stock: 30 },
  { _id: "p11", name: "Organic Green Tea (25 Bags)", description: "Rich in antioxidants. Refreshing green tea for overall wellness.", price: 135, mrp: 160, image: "https://placehold.co/400x400/C8E6C9/333333?text=Green+Tea", sku: "BEV-GREEN-TEA", category: "beverages", stock: 20 },
  { _id: "p12", name: "Potato Chips Classic Salted (50g)", description: "Crunchy, thin, and lightly salted potato chips.", price: 20, mrp: 20, image: "https://placehold.co/400x400/FFF9C4/333333?text=Potato+Chips", sku: "SNA-CHIPS-SALTED", category: "snacks", stock: 50 },
  { _id: "p13", name: "Roasted Almonds (100g)", description: "Salted and dry-roasted premium California almonds.", price: 150, mrp: 180, image: "https://placehold.co/400x400/D7CCC8/333333?text=Almonds", sku: "SNA-ALMOND-ROAST", category: "snacks", stock: 16 },
  { _id: "p14", name: "Vim Dishwash Gel Lemon (250ml)", description: "Super effective lemon dishwashing liquid gel.", price: 55, mrp: 60, image: "https://placehold.co/400x400/FFF59D/333333?text=Vim+Gel", sku: "HOU-VIM-LEMON", category: "household", stock: 32 },
  { _id: "p15", name: "Surf Excel Laundry Liquid (1L)", description: "Tough stain removal in machines with a pleasant scent.", price: 220, mrp: 260, image: "https://placehold.co/400x400/BBDEFB/333333?text=Surf+Excel", sku: "HOU-SURF-LAUNDRY", category: "household", stock: 10 }
];

export const MOCK_STORES = [
  { _id: "s1", name: "Connaught Place Dark Store", address: "Radial Road 3, Connaught Place, New Delhi", location: { coordinates: [77.2197, 28.6304] } },
  { _id: "s2", name: "Saket Hyperlocal Warehouse", address: "Block M, Saket, New Delhi", location: { coordinates: [77.2089, 28.5244] } },
  { _id: "s3", name: "Karol Bagh Fulfillment Hub", address: "Pusa Road, Karol Bagh, New Delhi", location: { coordinates: [77.1888, 28.6444] } }
];

export const ADDR_OPTIONS = [
  { label: "India Gate (Central Delhi)", text: "Kartavya Path, New Delhi, DL 110001", coords: [77.2295, 28.6129] },
  { label: "Saket City Mall (South Delhi)", text: "Press Enclave Marg, Saket, DL 110017", coords: [77.2185, 28.5286] },
  { label: "Rajendra Place (West Delhi)", text: "Pusa Road, Karol Bagh, DL 110008", coords: [77.1798, 28.6425] }
];

export const AppContext = createContext();

export function AppProvider({ children }) {
  // Global State
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user"); // user, admin, rider
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const [selectedAddress, setSelectedAddress] = useState(ADDR_OPTIONS[0]);
  const [nearestStore, setNearestStore] = useState(null);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [stores, setStores] = useState(MOCK_STORES);
  
  // Simulator Flags
  const [offlineMode, setOfflineMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // multiplier
  const [gpsProgress, setGpsProgress] = useState(0); // 0 to 100%
  const [isGpsSimulating, setIsGpsSimulating] = useState(false);

  // Load User details on mount
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      // Demo defaults
      setNearestStore(MOCK_STORES[0]);
    }
  }, [token]);

  // Handle address change to find nearest store
  useEffect(() => {
    findNearestStore(selectedAddress.coords[0], selectedAddress.coords[1]);
  }, [selectedAddress]);

  const findNearestStore = async (lng, lat) => {
    if (offlineMode) {
      // Find closest using standard distance calculation
      let minDistance = Infinity;
      let closest = MOCK_STORES[0];
      MOCK_STORES.forEach(s => {
        const dist = Math.sqrt(Math.pow(s.location.coordinates[0] - lng, 2) + Math.pow(s.location.coordinates[1] - lat, 2));
        if (dist < minDistance) {
          minDistance = dist;
          closest = s;
        }
      });
      setNearestStore(closest);
      return;
    }

    try {
      const response = await api.get(`/catalog/nearest-store?longitude=${lng}&latitude=${lat}`);
      if (response.data.success) {
        setNearestStore(response.data.data);
      }
    } catch (error) {
      console.warn("Failed to reach backend nearest store API, switching to offline simulation.");
      setOfflineMode(true);
      // fallback
      let minDistance = Infinity;
      let closest = MOCK_STORES[0];
      MOCK_STORES.forEach(s => {
        const dist = Math.sqrt(Math.pow(s.location.coordinates[0] - lng, 2) + Math.pow(s.location.coordinates[1] - lat, 2));
        if (dist < minDistance) {
          minDistance = dist;
          closest = s;
        }
      });
      setNearestStore(closest);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/profile");
      if (response.data.success) {
        setUser(response.data.data);
        setRole(response.data.data.role);
        if (response.data.data.address?.text) {
          // Sync with user saved coords
          setSelectedAddress({
            label: "Saved Profile Address",
            text: response.data.data.address.text,
            coords: response.data.data.address.coordinates
          });
        }
      }
    } catch (error) {
      console.error("Profile fetch error, using locally cached profile details.");
      // Dummy profile
      setUser({
        _id: "u_demo",
        username: "quick_shopper",
        email: "shopper@kartly.io",
        fullname: "Alex Carter",
        role: "user",
        address: { text: ADDR_OPTIONS[0].text, coordinates: ADDR_OPTIONS[0].coords }
      });
      setRole("user");
    }
  };

  // Fetch product catalog for nearest store
  useEffect(() => {
    if (nearestStore) {
      fetchCatalog(nearestStore._id);
    }
  }, [nearestStore, offlineMode]);

  const fetchCatalog = async (storeId) => {
    if (offlineMode) {
      // Simulate store-specific stock fluctuations
      const seedRandomStock = MOCK_PRODUCTS.map(p => {
        // use last digit of storeId to seed different stock counts
        const offset = storeId === "s2" ? 5 : storeId === "s3" ? -4 : 0;
        return { ...p, stock: Math.max(2, p.stock + offset) };
      });
      setProducts(seedRandomStock);
      return;
    }

    try {
      const response = await api.get(`/catalog/products?storeId=${storeId}`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      setOfflineMode(true);
      fetchCatalog(storeId);
    }
  };

  // Pull Orders history
  const fetchOrders = async () => {
    if (offlineMode || !token) return;
    try {
      let endpoint = "/orders/customer/history";
      if (role === "admin") endpoint = "/orders/admin/all";
      if (role === "rider") endpoint = "/orders/rider/available";

      const response = await api.get(endpoint);
      if (response.data.success) {
        setOrders(response.data.data);
        // Sync active order if any
        if (role === "user") {
          const active = response.data.data.find(o => !["DELIVERED", "CANCELLED"].includes(o.status));
          if (active) setActiveOrder(active);
        }
      }
    } catch (error) {
      console.warn("Backend unavailable for order lists. Using simulated order stack.");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // pull updates
    return () => clearInterval(interval);
  }, [role, token, offlineMode]);

  // Auth Operations
  const handleLogin = async (username, password, selectedRole = "user") => {
    if (offlineMode || username.includes("test") || username.includes("demo")) {
      // Simulated Auth
      const dummyUser = {
        _id: `u_${selectedRole}_${Math.floor(Math.random() * 100)}`,
        username: username || `${selectedRole}_guest`,
        email: `${username || selectedRole}@kartly.io`,
        fullname: username ? username.toUpperCase() : `Simulated ${selectedRole}`,
        role: selectedRole,
        address: { text: selectedAddress.text, coordinates: selectedAddress.coords }
      };
      setUser(dummyUser);
      setRole(selectedRole);
      setToken("offline_token_jwt");
      localStorage.setItem("accessToken", "offline_token_jwt");
      return { success: true };
    }

    try {
      const response = await api.post("/auth/login", { username, password });
      if (response.data.success) {
        const { user: userResponse, accessToken } = response.data.data;
        setUser(userResponse);
        setRole(userResponse.role);
        setToken(accessToken);
        localStorage.setItem("accessToken", accessToken);
        return { success: true };
      }
    } catch (error) {
      // Fallback auth
      const dummyUser = {
        _id: `u_${selectedRole}_${Math.floor(Math.random() * 100)}`,
        username: username,
        email: `${username}@kartly.io`,
        fullname: username.toUpperCase(),
        role: selectedRole,
        address: { text: selectedAddress.text, coordinates: selectedAddress.coords }
      };
      setUser(dummyUser);
      setRole(selectedRole);
      setToken("offline_token_jwt");
      localStorage.setItem("accessToken", "offline_token_jwt");
      setOfflineMode(true);
      return { success: true };
    }
  };

  const handleRegister = async (username, email, password, fullname, roleSelection) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
        fullname,
        role: roleSelection,
        addressText: selectedAddress.text,
        coordinates: selectedAddress.coords
      });
      if (response.data.success) {
        return { success: true };
      }
    } catch (error) {
      console.warn("Register API failed, completing registration in simulated mode.");
      setOfflineMode(true);
      return { success: true };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole("user");
    setToken(null);
    setCart([]);
    setActiveOrder(null);
    localStorage.removeItem("accessToken");
  };

  // Cart Operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // cap by stock
        return prev.map(item =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev =>
      prev.map(item =>
        item.product._id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const updateCartQuantity = (productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.product._id !== productId));
    } else {
      setCart(prev => prev.map(item => 
        item.product._id === productId ? { ...item, quantity: qty } : item
      ));
    }
  };

  // Checkout and Order placement
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const formattedItems = cart.map(item => ({
      productId: item.product._id,
      quantity: item.quantity
    }));

    if (offlineMode) {
      // Simulated Order Creation
      const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const deliveryFee = subtotal > 500 ? 0 : 25;
      const total = subtotal + deliveryFee;
      
      const newOrder = {
        _id: `ord_${Math.floor(100000 + Math.random() * 900000)}`,
        customer: user || { fullname: "Guest Shopper", address: selectedAddress },
        store: nearestStore,
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal,
        deliveryFee,
        total,
        status: "CONFIRMED",
        deliveryAddress: { text: selectedAddress.text, coordinates: selectedAddress.coords },
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        paymentStatus: "PAID",
        timeline: [{ status: "CONFIRMED", timestamp: new Date() }],
        createdAt: new Date().toISOString()
      };

      // Decrement simulated stock
      setProducts(prev =>
        prev.map(p => {
          const cartItem = cart.find(ci => ci.product._id === p._id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        })
      );

      setOrders(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);
      setCart([]);
      return { success: true };
    }

    try {
      const response = await api.post("/orders", {
        storeId: nearestStore._id,
        items: formattedItems,
        deliveryAddressText: selectedAddress.text,
        coordinates: selectedAddress.coords
      });

      if (response.data.success) {
        setActiveOrder(response.data.data);
        setCart([]);
        fetchOrders();
        return { success: true };
      }
    } catch (error) {
      alert(error.response?.data?.message || "Checkout failed. Stock availability might have changed.");
    }
  };

  // Admin Actions
  const updateOrderState = async (orderId, newStatus, otpVal = "") => {
    if (offlineMode) {
      setOrders(prev =>
        prev.map(o => {
          if (o._id === orderId) {
            // Verify OTP
            if (newStatus === "DELIVERED" && otpVal.toString() !== o.otp) {
              alert("Invalid OTP! Delivery rejected.");
              return o;
            }
            const updated = {
              ...o,
              status: newStatus,
              timeline: [...o.timeline, { status: newStatus, timestamp: new Date() }]
            };
            if (activeOrder && activeOrder._id === orderId) {
              setActiveOrder(updated);
            }
            return updated;
          }
          return o;
        })
      );
      return;
    }

    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus, otp: otpVal });
      if (response.data.success) {
        fetchOrders();
        if (activeOrder && activeOrder._id === orderId) {
          setActiveOrder(response.data.data);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed.");
    }
  };

  const assignRiderToOrder = async (orderId, riderId) => {
    if (offlineMode) {
      setOrders(prev =>
        prev.map(o => {
          if (o._id === orderId) {
            const updated = {
              ...o,
              status: "ASSIGNED",
              rider: { _id: riderId, fullname: riderId === "r1" ? "Rider Rohit" : "Rider Priya", role: "rider" },
              timeline: [...o.timeline, { status: "ASSIGNED", timestamp: new Date() }]
            };
            if (activeOrder && activeOrder._id === orderId) {
              setActiveOrder(updated);
            }
            return updated;
          }
          return o;
        })
      );
      return;
    }

    try {
      const response = await api.post(`/orders/${orderId}/assign`, { riderId });
      if (response.data.success) {
        fetchOrders();
      }
    } catch (error) {
      alert("Failed to assign rider");
    }
  };

  // Adjust stock count in store
  const adjustStock = async (productId, newStock) => {
    if (offlineMode) {
      setProducts(prev =>
        prev.map(p => (p._id === productId ? { ...p, stock: newStock } : p))
      );
      return;
    }

    try {
      const response = await api.post("/catalog/update-stock", {
        storeId: nearestStore._id,
        productId,
        stock: newStock
      });
      if (response.data.success) {
        fetchCatalog(nearestStore._id);
      }
    } catch (error) {
      console.error("Stock adjust failed, falling back to local edit.");
      setProducts(prev =>
        prev.map(p => (p._id === productId ? { ...p, stock: newStock } : p))
      );
    }
  };

  // GPS Simulation Trigger (Out for Delivery -> Delivered movement)
  useEffect(() => {
    let timer;
    if (isGpsSimulating) {
      timer = setInterval(() => {
        setGpsProgress(prev => {
          if (prev >= 100) {
            setIsGpsSimulating(false);
            clearInterval(timer);
            return 100;
          }
          return prev + (3 * simulationSpeed);
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isGpsSimulating, simulationSpeed]);

  useEffect(() => {
    if (activeOrder?.status === "OUT_FOR_DELIVERY" && !isGpsSimulating && gpsProgress < 100) {
      setIsGpsSimulating(true);
    }
  }, [activeOrder?.status]);

  const resetGpsSimulation = () => {
    setGpsProgress(0);
    setIsGpsSimulating(false);
  };

  return (
    <AppContext.Provider
      value={{
        user, setUser,
        role, setRole,
        token, setToken,
        selectedAddress, setSelectedAddress,
        nearestStore, setNearestStore,
        products, setProducts,
        cart, setCart,
        orders, setOrders,
        activeOrder, setActiveOrder,
        stores,
        offlineMode, setOfflineMode,
        addToCart, removeFromCart, updateCartQuantity,
        handleLogin, handleRegister, handleLogout,
        handleCheckout,
        updateOrderState,
        assignRiderToOrder,
        adjustStock,
        gpsProgress, setGpsProgress,
        isGpsSimulating, setIsGpsSimulating,
        simulationSpeed, setSimulationSpeed,
        resetGpsSimulation,
        fetchOrders
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
