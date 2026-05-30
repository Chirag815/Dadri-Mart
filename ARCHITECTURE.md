# Architecture Overview

## 1. Authentication Flow
- **OTP Login**: Users enter phone number, receive a 4‑digit code via SMS (simulated). The code is verified and a JWT token is issued.
- **Roles**: After successful OTP verification the user selects a role (**customer**, **vendor**, **admin**). The role is stored in the JWT and propagated via `AppContext`.
- **Protected Routes**: Frontend routes check the role from context; admin routes are hidden behind `/admin‑login`.

## 2. Customer Flow
1. **Landing / Auth** – OTP login screen.
2. **Dashboard** – Browse products, search, filter by category.
3. **Pincode Check** – Service‑area validation before checkout.
4. **Cart & Checkout** – Add items, review order, place COD order.
5. **Order Tracker** – Live status updates (Accepted → Packing → Ready → Delivered → Payment Received).
6. **Profile** – View/Edit name, email, phone, address, pincode.

## 3. Vendor Flow
- Access via `/vendor-portal` after selecting **vendor** role.
- **Dashboard** shows tabs: New Orders, Active Orders, Delivered, Cancelled.
- Actions per order: **Accept**, **Mark Packing**, **Mark Ready‑for‑Delivery**, **Mark Delivered**, **Mark Payment Received**.
- Order details include customer info, notes, and COD status.

## 4. Admin Flow
- Hidden route `/admin-login` (not shown on landing page).
- After login, admin can:
  - Manage service‑area pincodes.
  - Configure store opening/closing hours.
  - View analytics (sales, order counts, revenue). 

## 5. Order Lifecycle
```
Order Placed → Accepted → Packing → Ready For Delivery → Delivered → Payment Received
```
Each transition is a distinct API endpoint that updates the `status` field in MongoDB. The frontend listens for real‑time updates via polling.

## 6. Service Area Logic
- Pincodes are stored in `Backend/app/models/pincode.models.js`.
- On the frontend, the `checkPincode` function validates the entered pincode against the API.
- If unavailable, the UI blocks checkout and displays a friendly message.

## 7. Technical Stack
- **Frontend**: React, React Router, Context API, vanilla CSS with glassmorphism, gradients, micro‑animations.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **State Management**: Centralised `AppContext` provides token, role, user data, orders, cart, and utilities.
- **Port Configuration**: Backend runs on port **4001** (updated to avoid conflicts).

---
*Diagram of component interaction is omitted for brevity but can be generated on demand.*
