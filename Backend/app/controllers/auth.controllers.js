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
    throw new Error("Something went wrong while generating referesh and access token");
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, fullname, role, addressText, coordinates } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required"
      });
    }

    const existedUser = await userModel.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (existedUser) {
      return res.status(409).json({
        success: false,
        message: "User with email or username already exists"
      });
    }

    const userAddress = {
      text: addressText || "",
      coordinates: coordinates || [77.2090, 28.6139] // default Delhi coords
    };

    const user = await userModel.create({
      fullname,
      email: email.toLowerCase(),
      password,
      username: username.toLowerCase(),
      role: role || "user",
      address: userAddress
    });

    const createdUser = await userModel.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while registering the user"
      });
    }

    return res.status(201).json({
      success: true,
      data: createdUser,
      message: "User registered successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email && !username) {
      return res.status(400).json({
        success: false,
        message: "Email or username is required"
      });
    }

    const user = await userModel.findOne({
      $or: [
        { email: email ? email.toLowerCase() : undefined },
        { username: username ? username.toLowerCase() : undefined }
      ].filter(Boolean)
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist"
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid user credentials"
      });
    }

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

export const logoutUser = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1 // removes the field from document
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
    const { addressText, coordinates } = req.body;

    if (!addressText || !coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Address text and longitude/latitude coordinates are required"
      });
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          address: {
            text: addressText,
            coordinates: coordinates // [longitude, latitude]
          }
        }
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

