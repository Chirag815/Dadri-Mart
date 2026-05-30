import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import catalogRouter from './routes/catalog.routes.js';
import orderRouter from './routes/order.routes.js';
import adminRouter from './routes/admin.routes.js';

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// routes
app.use("/api/auth", authRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export default app;