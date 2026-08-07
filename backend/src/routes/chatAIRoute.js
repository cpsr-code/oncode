const express = require('express');
const chatAIRouter = express.Router();
const userMiddleware = require('../middlewares/userMiddleware');
const chatWithAI = require('../controllers/chatWithAI');


chatAIRouter.post('/doubt', userMiddleware, chatWithAI);


module.exports = chatAIRouter;