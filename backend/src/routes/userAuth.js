const express = require('express');
const {register, login, logout, adminRegister, deleteProfile, checkAuth, getUserStats} =
require('../controllers/userAuthenticate');
const authRouter = express.Router();
const userMiddleware = require('../middlewares/userMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 requests per window
  standardHeaders: 'draft-7', 
  legacyHeaders: false, 
  message: { message: 'Too many authentication attempts, please try again later.' }
});

// different user routes 
authRouter.post("/register", authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.post("/logout", userMiddleware, logout);
authRouter.post("/admin/register", adminMiddleware, adminRegister);

authRouter.get("/profile", userMiddleware, getUserStats);
authRouter.delete("/profile",userMiddleware, deleteProfile);
authRouter.get("/check", userMiddleware, checkAuth);


module.exports = authRouter;