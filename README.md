# Kartly - Single Store Hyperlocal Grocery Platform

**Kartly** is a full‑stack quick‑commerce demo that implements a **single‑store hyperlocal grocery** experience.

### Core Business Model
- One grocery store serves the entire service area.
- Customers never see which physical store fulfills an order – the system abstracts that detail.
- All orders are **Cash‑On‑Delivery (COD)** only; no online‑payment integrations remain.
- Authentication is **passwordless OTP** (phone + 4‑digit code).
- Users are of three roles: **customer**, **vendor**, **admin**.
- The admin UI is hidden behind a secret route (`/admin-login`).

### Customer Features
- OTP login (customer or vendor).
- Browse products by category and search.
- Cart management (add, remove, quantity).
- Pincode availability check (service area gating).
- Simple profile page showing name, email, phone, address, and pincode.
- Address management – choose a preset location or enter a custom address.
- Order placement with live order tracker.
- Order history.

### Vendor Features
- Dedicated **Vendor Dashboard** (replaces former rider portal).
- View New, Active, Delivered, and Cancelled orders.
- Accept order, mark Packing, Ready‑for‑Delivery, Delivered, and **Payment Received**.
- Full order timeline with customer details, notes, and COD status.

### Admin Features
- Hidden admin route (`/admin-login`).
- Manage service area pincodes.
- Configure store opening/closing hours.
- View analytics (sales, order counts, etc.).

### Technical Stack
- **Frontend:** React, react‑router‑dom, lucide‑react, vanilla CSS with modern design (glassmorphism, gradients, micro‑animations).
- **Backend:** Node.js, Express, MongoDB.
- **State Management:** React Context (`AppContext`).
- **No inventory quantity tracking** – products are assumed to have unlimited stock.
- **No online‑payment gateways** – only COD flow.

### Project Status
- All core requirements are implemented and verified.
- The codebase is cleanly separated by role and ready for future multi‑vendor expansion.

---

Built for learning and demonstration of hyperlocal quick‑commerce workflows.
