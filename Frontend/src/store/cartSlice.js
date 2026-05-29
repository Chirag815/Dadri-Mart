import { createSlice } from "@reduxjs/toolkit";

// Cart slice — manages cart items entirely client-side
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],   // [{ product, quantity }]
  },
  reducers: {
    addItem(state, action) {
      const product = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);
      if (existing) {
        if (existing.quantity < (product.stock || 99)) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({ product, quantity: 1 });
      }
    },
    removeItem(state, action) {
      const id = action.payload;
      const idx = state.items.findIndex((i) => i.product._id === id);
      if (idx !== -1) {
        if (state.items[idx].quantity > 1) {
          state.items[idx].quantity -= 1;
        } else {
          state.items.splice(idx, 1);
        }
      }
    },
    setQuantity(state, action) {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.product._id !== productId);
      } else {
        const item = state.items.find((i) => i.product._id === productId);
        if (item) item.quantity = quantity;
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

export const { addItem, removeItem, setQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
