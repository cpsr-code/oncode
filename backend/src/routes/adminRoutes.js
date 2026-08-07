const express = require('express');


const adminMiddleware = require('../middlewares/adminMiddleware');
const { getDashboardStats } = require('../controllers/adminController');
const adminRouter = express.Router();

adminRouter.get('/dashboard',adminMiddleware, getDashboardStats);

module.exports = adminRouter;