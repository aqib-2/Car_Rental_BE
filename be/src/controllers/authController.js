const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asynHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const register = asyncHandler(async (req, res) => {
  let { name, email, password, role } = req.body;
  if ([name, email, password].some((item) => item.trim() === "")) {
    throw new ApiError(400, "All feilds are mandatory");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(
      409,
      "Email already registered.Please use a different one."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if(!role){
    role = 'user';
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User Registration failed");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are mandatory");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "The user does not exist");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new ApiError(400, "Invalid Credentials");
  }
  const refreshToken = generateRefreshToken(user._id);
  const accessToken = generateAccessToken(
    user._id,
    user.role,
    user.email,
    user.name
  );

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { refreshToken, accessToken },
        "User loggedIn Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User loggedout Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const userRefreshToken = req.body.refreshToken;
  if (!userRefreshToken) {
    throw new ApiError(400, "refresh token is required to proceed");
  }
  try {
    const decodedToken = jwt.verify(
      userRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken.id);
    if (!user) {
      throw new ApiError(404, "The user does not exist");
    }
    if (userRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is invalid");
    }
  
    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(
      user._id,
      user.role,
      user.email,
      user.name
    );
  
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { refreshToken, accessToken },
          "User loggedIn Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message ?? "Invalid refresh token");
  }
});

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const generateAccessToken = (userId, userRole, userEmail, userName) => {
  return jwt.sign(
    { id: userId, role: userRole, email: userEmail, name: userName },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
module.exports = {
  register,
  loginUser,
  logoutUser,
};
