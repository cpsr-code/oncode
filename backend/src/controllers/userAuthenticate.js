const User = require("../models/user");
const Submission = require("../models/submission");
const Problem = require("../models/problem");
const validate = require("../utils/validate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../config/redis");

// Centralized cookie options for consistency and security
const cookieOptions = {
  maxAge: 60 * 60 * 1000, // 1 hour
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Required for cross-origin cookies
};

// handler for authentication register, login, logout
const register = async (req, res) => {
  try {
    // validate data
    validate(req.body);
    const { firstName, email, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    // make this route is only for user role
    req.body.role = "user";

    // check for uniqueness of email -> mogoose will throw error automatically
    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: "user" },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, cookieOptions);

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      _id: user._id,
      role: user.role,
    };

    res.status(201).json({
      user: userData,
      message: "Registered Successfully",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    res.status(400).json({ message: "Registration failed: " + err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      user: userData,
      message: "Logged in successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed: " + err.message });
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    const payload = jwt.decode(token);

    // add it to redis blacklist untill it expired
    await client.set(`token:${token}`, "Blocked");
    await client.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, { ...cookieOptions, maxAge: 0 });

    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    res.status(503).json({ message: "Logout failed: " + err.message });
  }
};

const adminRegister = async (req, res) => {
  // this is route through which admin can register new admin or user
  try {
    // validate data
    validate(req.body);
    const { firstName, email, password, role} = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = role || "user";
    
    const user = await User.create(req.body);
    res.status(201).json({ message: "Registered successfully." });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    res.status(400).json({ message: "Registration failed." + err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndDelete(userId);

    res.cookie("token", null, { ...cookieOptions, maxAge: 0 });
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete profile." });
  }
};

const checkAuth = async (req, res) => {
  const reply = {
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    _id: req.user._id,
    role: req.user.role,
  };
  res.status(200).json({
    user: reply,
    message: "valid user session.",
  });
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch User and Populate Solved Problems
    // We only fetch the 'difficulty' field
    const user = await User.findById(userId).populate({
      path: "problemsSolved",
      select: "difficulty",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Calculate Difficulty Breakdown
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    user.problemsSolved.forEach((problem) => {
      const diff = problem.difficulty?.toLowerCase();
      if (diff === "easy") easySolved++;
      else if (diff === "medium") mediumSolved++;
      else if (diff === "hard") hardSolved++;
    });

    const totalSolved = easySolved + mediumSolved + hardSolved;

    // 3. Calculate Submission Metrics
    const totalSubmissions = await Submission.countDocuments({ userId });
    const acceptedSubmissions = await Submission.countDocuments({
      userId,
      status: "Accepted",
    });

    // 4. Calculate Acceptance Rate
    let acceptanceRate = 0;
    if (totalSubmissions > 0) {
      acceptanceRate = Math.round(
        (acceptedSubmissions / totalSubmissions) * 100,
      );
    }

    // 5. Format Join Date
    const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // 6. Send the precisely formatted payload to the frontend
    res.status(200).json({
      message: "User statistics fetched successfully",
      stats: {
        easySolved,
        mediumSolved,
        hardSolved,
        totalSolved,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate,
        joinDate,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user statistics: " + error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  checkAuth,
  getUserStats,
};
