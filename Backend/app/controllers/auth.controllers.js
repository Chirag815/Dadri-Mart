import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Something went wrong while generating refresh and access token");
  }
};

export const registerUser = async (req, res) => {
  try {
    const { email, fullname, phone, addressText, coordinates, pincode, role } = req.body;

    if (!email || !fullname || !phone || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Email, Full Name, Phone, and Pincode are required"
      });
    }

    const existedUser = await userModel.findOne({
      $or: [{ phone: phone.trim() }, { email: email.toLowerCase().trim() }]
    });

    if (existedUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email or phone number already exists"
      });
    }

    const userAddress = {
      text: addressText || "",
      coordinates: coordinates || [77.2090, 28.6139] // default Delhi coords
    };

    // Auto-generate a unique sparse username
    const username = `u_${phone}_${Math.floor(100 + Math.random() * 900)}`;

    const user = await userModel.create({
      fullname,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      role: role || "user",
      address: userAddress,
      username
    });

    const createdUser = await userModel.findById(user._id).select("-password -refreshToken");

    return res.status(201).json({
      success: true,
      data: createdUser,
      message: "User registered successfully! Please request an OTP to log in."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const user = await userModel.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Phone number not registered. Please sign up first."
      });
    }

    // Development/Demo OTP generation
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // e.g. random 4-digit code
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
    await user.save({ validateBeforeSave: false });

    // In demo/dev mode we return the OTP directly in response for ease of testing
    return res.status(200).json({
      success: true,
      otp, // returning to client for demo/simulation autocomplete
      message: `OTP sent successfully to ${phone} (Demo OTP: ${otp})`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const user = await userModel.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.otp || user.otp !== otp.toString().trim()) {
      return res.status(401).json({ success: false, message: "Invalid OTP code" });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(401).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
    const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      data: {
        user: loggedInUser,
        accessToken,
        refreshToken
      },
      message: "User logged in successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const loginUser = async (req, res) => {
  // Aliased to verifyOTP to keep backward compatibility if any callers hit /login
  return verifyOTP(req, res);
};

export const logoutUser = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1
        }
      },
      {
        new: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "User logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request"
      });
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await userModel.findById(decodedToken?._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is expired or used"
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    return res.status(200).json({
      success: true,
      data: { accessToken, refreshToken },
      message: "Access token refreshed successfully"
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error?.message || "Invalid refresh token"
    });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
    message: "Current user fetched successfully"
  });
};

export const updateUserAddress = async (req, res) => {
  try {
    const { addressText, coordinates, pincode } = req.body;

    if (!addressText || !coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Address text and longitude/latitude coordinates are required"
      });
    }

    const updateFields = {
      address: {
        text: addressText,
        coordinates: coordinates
      }
    };

    if (pincode) {
      updateFields.pincode = pincode.trim();
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: updateFields
      },
      { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      data: user,
      message: "Address updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users,
      message: "Users fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};
