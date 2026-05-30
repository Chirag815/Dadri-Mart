import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    avatar: {
      type: { url: String, localPath: String },
      default: {
        url: `https://placehold.co/400x400`,
        localPath: "",
      },
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
      sparse: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
    },
    fullname: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      index: true,
      trim: true
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true
    },
    otp: {
      type: String
    },
    otpExpiry: {
      type: Date
    },
    isEmailverified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "vendor", "admin"], // user=Customer, vendor=Store Vendor, admin=System Superuser
      default: "user",
    },
    address: {
      text: { type: String, default: "" },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.2090, 28.6139] // Default coordinates (Delhi)
      }
    }
  },
  {
    timestamps: true,
  },
);

// pre hooks — Mongoose 9: async pre hooks return a promise; do not call next()
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username || this.phone,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d",
    }
  );
};

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
