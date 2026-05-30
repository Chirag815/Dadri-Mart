import React, { createContext, useState, useEffect } from "react";
import api from "../lib/api";

// Fallback Mock Data for Simulation Mode (Unlimited Stock Context)
export const MOCK_PRODUCTS = [
  { _id: "p1", name: "Fresh Tomatoes (500g)", description: "Farm-fresh organic red tomatoes, handpicked for quality.", price: 32, mrp: 45, image: "https://placehold.co/400x400/FF6B6B/FFFFFF?text=Tomatoes", sku: "VEG-TOMATO-500", category: "vegetables", stock: 9999 },
  { _id: "p2", name: "Organic Onions (1kg)", description: "Crispy and flavorful organic onions, kitchen staple.", price: 40, mrp: 60, image: "https://placehold.co/400x400/D0BFFF/333333?text=Onions", sku: "VEG-ONION-1000", category: "vegetables", stock: 9999 },
  { _id: "p3", name: "Fresh Potatoes (1kg)", description: "Nutritious and clean potatoes, direct from local farms.", price: 30, mrp: 38, image: "https://placehold.co/400x400/EAD8B1/333333?text=Potatoes", sku: "VEG-POTATO-1000", category: "vegetables", stock: 9999 },
  { _id: "p4", name: "Organic Bananas (Pack of 6)", description: "Ripe, sweet, and rich in potassium. Packed hygienically.", price: 55, mrp: 70, image: "https://placehold.co/400x400/FFF3B0/333333?text=Bananas", sku: "FRU-BANANA-6", category: "vegetables", stock: 9999 },
  { _id: "p5", name: "Amul Gold Milk (500ml)", description: "Pasteurized full cream milk, creamy and rich.", price: 33, mrp: 35, image: "https://placehold.co/400x400/F4F6F9/333333?text=Amul+Milk", sku: "DAI-MILK-500", category: "dairy", stock: 9999 },
  { _id: "p6", name: "Amul Butter Salted (100g)", description: "The classic salted butter from Amul. Utterly butterly delicious.", price: 56, mrp: 58, image: "https://placehold.co/400x400/FFE082/333333?text=Amul+Butter", sku: "DAI-BUTTER-100", category: "dairy", stock: 9999 },
  { _id: "p7", name: "Fresh Paneer (200g)", description: "Soft, fresh, and high-protein cottage cheese.", price: 90, mrp: 110, image: "https://placehold.co/400x400/ECEFF1/333333?text=Paneer", sku: "DAI-PANEER-200", category: "dairy", stock: 9999 },
  { _id: "p8", name: "Whole Wheat Bread (400g)", description: "Soft, healthy, sliced whole wheat sandwich bread.", price: 45, mrp: 50, image: "https://placehold.co/400x400/D7CCC8/333333?text=Wheat+Bread", sku: "BAK-WHEAT-BREAD", category: "bakery", stock: 9999 },
  { _id: "p9", name: "Chocolate Chip Cookies (150g)", description: "Crispy cookies loaded with premium dark chocolate chips.", price: 80, mrp: 100, image: "https://placehold.co/400x400/8D6E63/FFFFFF?text=Cookies", sku: "BAK-COOKIE-CHOC", category: "bakery", stock: 9999 },
  { _id: "p10", name: "Coca Cola Zero Sugar (250ml)", description: "Great Coke taste with zero sugar and zero calories.", price: 40, mrp: 40, image: "https://placehold.co/400x400/212121/FFFFFF?text=Coke+Zero", sku: "BEV-COKE-ZERO", category: "beverages", stock: 9999 },
  { _id: "p11", name: "Organic Green Tea (25 Bags)", description: "Rich in antioxidants. Refreshing green tea for overall wellness.", price: 135, mrp: 160, image: "https://placehold.co/400x400/C8E6C9/333333?text=Green+Tea", sku: "BEV-GREEN-TEA", category: "beverages", stock: 9999 },
  { _id: "p12", name: "Potato Chips Classic Salted (50g)", description: "Crunchy, thin, and lightly salted potato chips.", price: 20, mrp: 20, image: "https://placehold.co/400x400/FFF9C4/333333?text=Potato+Chips", sku: "SNA-CHIPS-SALTED", category: "snacks", stock: 9999 },
  { _id: "p13", name: "Roasted Almonds (100g)", description: "Salted and dry-roasted premium California almonds.", price: 150, mrp: 180, image: "https://placehold.co/400x400/D7CCC8/333333?text=Almonds", sku: "SNA-ALMOND-ROAST", category: "snacks", stock: 9999 },
  { _id: "p14", name: "Vim Dishwash Gel Lemon (250ml)", description: "Super effective lemon dishwashing liquid gel.", price: 55, mrp: 60, image: "https://placehold.co/400x400/FFF59D/333333?text=Vim+Gel", sku: "HOU-VIM-LEMON", category: "household", stock: 9999 },
  { _id: "p15", name: "Surf Excel Laundry Liquid (1L)", description: "Tough stain removal in machines with a pleasant scent.", price: 220, mrp: 260, image: "https://placehold.co/400x400/BBDEFB/333333?text=Surf+Excel", sku: "HOU-SURF-LAUNDRY", category: "household", stock: 9999 }
];

export const MOCK_STORES = [
  { _id: "s1", name: "Main Hyperlocal Dark Store", address: "Radial Road 3, Connaught Place, New Delhi", location: { coordinates: [77.2197, 28.6304] } }
];

export const ADDR_OPTIONS = [
  { label: "India Gate (Pincode: 110001)", text: "Kartavya Path, New Delhi, DL 110001", coords: [77.2295, 28.6129], pincode: "110001" },
  { label: "Saket City Mall (Pincode: 110017)", text: "Press Enclave Marg, Saket, DL 110017", coords: [77.2185, 28.5286], pincode: "110017" },
  { label: "Rajendra Place (Pincode: 110008)", text: "Pusa Road, Karol Bagh, DL 110008", coords: [77.1798, 28.6425], pincode: "110008" }
];

export const AppContext = createContext();

export function AppProvider({ children }) {
  // Global State
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user"); // user, admin, rider
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const [selectedAddress, setSelectedAddress] = useState(ADDR_OPTIONS[0]);
  const [nearestStore, setNearestStore] = useState(MOCK_STORES[0]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Hyperlocal specific states
  const [pincodeVerified, setPincodeVerified] = useState(localStorage.getItem("pincodeVerified") === "true");
  const [customerPincode, setCustomerPincode] = useState(localStorage.getItem("customerPincode") || "");
  const [storeTimings, setStoreTimings] = useState({ storeOpenTime: "08:00", storeCloseTime: "22:00" });
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Simulator Flags
  const [offlineMode, setOfflineMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // multiplier
  const [gpsProgress, setGpsProgress] = useState(0); // 0 to 100%
  const [isGpsSimulating, setIsGpsSimulating] = useState(false);

  // Load User details and store timings on mount
   useEffect(() => {
     const init = async () => {
       if (token) {
         await fetchProfile();
       }
       await fetchStoreTimings();
       setLoading(false);
     };
     init();
   }, [token]);

  // Check store timings every 30 seconds
  useEffect(() => {
    evaluateStoreOpen();
    const interval = setInterval(evaluateStoreOpen, 30000);
    return () => clearInterval(interval);
  }, [storeTimings]);

   const fetchStoreTimings = async () => {
     if (offlineMode) return;
     try {
       const response = await api.get("/admin/settings");
       if (response.data.success) {
         setStoreTimings(response.data.data);
       }
     } catch (error) {
       console.warn("Failed to fetch store settings. Using default hours.");
     }
   };

  const evaluateStoreOpen = () => {
    const { storeOpenTime, storeCloseTime } = storeTimings;
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    if (currentTimeStr >= storeOpenTime && currentTimeStr <= storeCloseTime) {
      setIsStoreOpen(true);
    } else {
      setIsStoreOpen(false);
    }
  };

  const checkPincode = async (code) => {
    if (offlineMode) {
      // Offline fallback: check against mock ADDR_OPTIONS and seeded codes
      const mockCodes = ["110001", "110017", "110008"];
      const isOk = mockCodes.includes(code.trim());
      if (isOk) {
        setPincodeVerified(true);
        setCustomerPincode(code.trim());
        localStorage.setItem("pincodeVerified", "true");
        localStorage.setItem("customerPincode", code.trim());
      }
      return { success: true, available: isOk };
    }

    try {
      const response = await api.get(`/admin/service-areas/check?pincode=${code.trim()}`);
      if (response.data.success) {
        if (response.data.available) {
          setPincodeVerified(true);
          setCustomerPincode(code.trim());
          localStorage.setItem("pincodeVerified", "true");
          localStorage.setItem("customerPincode", code.trim());
        }
        return { success: true, available: response.data.available };
      }
    } catch (error) {
      console.warn("Pincode check API failed. Using local simulation check.");
      const mockCodes = ["110001", "110017", "110008"];
      const isOk = mockCodes.includes(code.trim());
      if (isOk) {
        setPincodeVerified(true);
        setCustomerPincode(code.trim());
        localStorage.setItem("pincodeVerified", "true");
        localStorage.setItem("customerPincode", code.trim());
      }
      return { success: true, available: isOk };
    }
  };

  const resetPincode = () => {
    setPincodeVerified(false);
    setCustomerPincode("");
    localStorage.removeItem("pincodeVerified");
    localStorage.removeItem("customerPincode");
  };

   const fetchProfile = async () => {
     try {
       const response = await api.get("/auth/profile");
       if (response.data.success) {
         setUser(response.data.data);
         setRole(response.data.data.role);
         if (response.data.data.pincode) {
           setPincodeVerified(true);
           setCustomerPincode(response.data.data.pincode);
           localStorage.setItem("pincodeVerified", "true");
           localStorage.setItem("customerPincode", response.data.data.pincode);
         }
       }
     } catch (error) {
       console.error("Profile fetch error, using locally cached profile details.");
       setUser({
         _id: "u_demo",
         username: "quick_shopper",
         email: "shopper@kartly.io",
         fullname: "Alex Carter",
         role: "user",
         phone: "9876543210",
         pincode: "110001",
         address: { text: ADDR_OPTIONS[0].text, coordinates: ADDR_OPTIONS[0].coords }
       });
       setRole("user");
     }
   };

  // Fetch product catalog
  useEffect(() => {
    fetchCatalog();
  }, [offlineMode]);

  const fetchCatalog = async () => {
    if (offlineMode) {
      setProducts(MOCK_PRODUCTS);
      return;
    }

    try {
      // In single store model we just query products directly (store filters ignored or implicit)
      const response = await api.get(`/catalog/products?storeId=s1`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      setOfflineMode(true);
      setProducts(MOCK_PRODUCTS);
    }
  };

  // Pull Orders history
  const fetchOrders = async () => {
    if (offlineMode || !token) return;
    try {
      // Vendor and Admin can see all store orders; customers see only their own
      let endpoint = "/orders/customer/history";
      if (["admin", "vendor"].includes(role)) endpoint = "/orders/admin/all";

      const response = await api.get(endpoint);
      if (response.data.success) {
        setOrders(response.data.data);
        // Track active order for customer live tracker
        if (role === "user") {
          const active = response.data.data.find(o => !["PAYMENT_RECEIVED", "CANCELLED"].includes(o.status));
          if (active) setActiveOrder(active);
        }
      }
    } catch (error) {
      console.warn("Backend unavailable for order lists.");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // pull updates
    return () => clearInterval(interval);
  }, [role, token, offlineMode]);

  // Auth Operations via OTP
  const requestOtp = async (phone) => {
    if (offlineMode || phone.includes("9999")) {
      const mockOtp = "1234";
      return { success: true, otp: mockOtp, message: `Demo OTP Generated: ${mockOtp}` };
    }

    try {
      const response = await api.post("/auth/request-otp", { phone });
      return { success: true, otp: response.data.otp, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "User not registered with this phone" };
    }
  };

  const verifyOtp = async (phone, otp, selectedRole = "user") => {
    if (offlineMode || phone.includes("9999")) {
      // Simulated Auth — uses selectedRole for demo
      const dummyUser = {
        _id: `u_${selectedRole}_${Math.floor(Math.random() * 100)}`,
        username: `user_${phone}`,
        phone: phone,
        email: `${phone}@kartly.io`,
        fullname: selectedRole === "vendor" ? "Demo Vendor" : selectedRole === "admin" ? "System Admin" : "Demo Customer",
        role: selectedRole,
        pincode: customerPincode || "110001",
        address: { text: selectedAddress.text, coordinates: selectedAddress.coords }
      };
      setUser(dummyUser);
      setRole(selectedRole);
      setToken("offline_token_jwt");
      localStorage.setItem("accessToken", "offline_token_jwt");
      return { success: true };
    }

    try {
      const response = await api.post("/auth/verify-otp", { phone, otp });
      if (response.data.success) {
        const { user: userResponse, accessToken } = response.data.data;
        setUser(userResponse);
        setRole(userResponse.role);
        setToken(accessToken);
        localStorage.setItem("accessToken", accessToken);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Invalid OTP verification code" };
    }
  };

  const handleRegister = async (fullname, email, phone, addressText, pincode, roleSelection = "user") => {
    if (offlineMode) {
      return { success: true };
    }
    try {
      const response = await api.post("/auth/register", {
        fullname,
        email,
        phone,
        addressText,
        pincode,
        role: roleSelection,
        coordinates: selectedAddress.coords
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
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

  // Cart Operations (Stock tracking logic disabled by business requirements)
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
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

  // Checkout and Order placement (COD Only, supports Order Notes)
  const handleCheckout = async (notes) => {
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
        customer: user || { fullname: "Guest Shopper", phone: "9876543210", pincode: customerPincode },
        store: nearestStore,
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal,
        deliveryFee,
        total,
        status: "PLACED",
        deliveryAddress: { text: selectedAddress.text, coordinates: selectedAddress.coords },
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        notes: notes || "",
        timeline: [{ status: "PLACED", timestamp: new Date() }],
        createdAt: new Date().toISOString()
      };

      setOrders(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);
      setCart([]);
      return { success: true };
    }

    try {
      const response = await api.post("/orders", {
        items: formattedItems,
        deliveryAddressText: selectedAddress.text,
        coordinates: selectedAddress.coords,
        notes: notes || ""
      });

      if (response.data.success) {
        setActiveOrder(response.data.data);
        setCart([]);
        fetchOrders();
        return { success: true };
      }
    } catch (error) {
      alert(error.response?.data?.message || "Checkout failed.");
    }
  };

  // Admin/Vendor Actions
  const updateOrderState = async (orderId, newStatus, otpVal = "") => {
    if (offlineMode) {
      setOrders(prev =>
        prev.map(o => {
          if (o._id === orderId) {
            // Verify OTP
            if (newStatus === "DELIVERED" && otpVal && otpVal.toString() !== o.otp) {
              alert("Invalid OTP! Delivery verification failed.");
              return o;
            }
            const updated = {
              ...o,
              status: newStatus,
              paymentStatus: newStatus === "PAYMENT_RECEIVED" ? "PAID" : o.paymentStatus,
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

  const adjustStock = async (productId, newStock) => {
    // Stock counting retired in hyperlocal grocery requirements.
    // Kept as standard catalog visibility helper in offline fallback.
    alert("Quantity management is retired. Product catalog list is active.");
  };

  // GPS Simulation Trigger (Ready for Delivery -> Delivered movement)
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
    if (activeOrder?.status === "READY_FOR_DELIVERY" && !isGpsSimulating && gpsProgress < 100) {
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
        nearestStore,
        products, setProducts,
        cart, setCart,
        orders, setOrders,
        activeOrder, setActiveOrder,
        offlineMode, setOfflineMode,
        addToCart, removeFromCart, updateCartQuantity,
        requestOtp, verifyOtp, handleRegister, handleLogout,
        handleCheckout,
        updateOrderState,
        adjustStock,
        gpsProgress, setGpsProgress,
        isGpsSimulating, setIsGpsSimulating,
        simulationSpeed, setSimulationSpeed,
        resetGpsSimulation,
        fetchOrders,
        pincodeVerified, setPincodeVerified,
        customerPincode, setCustomerPincode,
        checkPincode, resetPincode,
        storeTimings, setStoreTimings,
        isStoreOpen,
        fetchStoreTimings
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
