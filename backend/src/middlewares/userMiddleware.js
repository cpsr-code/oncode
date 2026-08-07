const jwt = require("jsonwebtoken");
const User = require("../models/user");
const client = require("../config/redis");

// verify user is valid and logged in
const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is missing. Please log in." });
    }

    // verify token
    const payload = jwt.verify(token, process.env.JWT_KEY);

    const { _id } = payload;
    if (!_id) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    // check in redis blockList
    const isBlocked = await client.exists(`token:${token}`);
    if (isBlocked) {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User account no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    const errorMessage =
      err.name === "TokenExpiredError"
        ? "Your session has expired. Please log in again."
        : "Authentication failed.";

    res.status(401).json({ message: errorMessage });
  }
};

module.exports = userMiddleware;
