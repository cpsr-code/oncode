const express = require('express');
const submitRouter = express.Router();

const userMiddleware = require('../middlewares/userMiddleware');
const {submitCode, runCode} = require('../controllers/submissionController');
const rateLimit = require('express-rate-limit');

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // Limit each IP to 50 code submissions per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many submissions. Please wait a few minutes before trying again.' }
});


submitRouter.post("/submit/:id", userMiddleware, submitLimiter, submitCode);
submitRouter.post("/run/:id", userMiddleware, submitLimiter, runCode);


module.exports = submitRouter;