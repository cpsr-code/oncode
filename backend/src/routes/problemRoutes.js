const express = require('express');
const adminMiddleware = require('../middlewares/adminMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');
const {createProblem, updateProblem,deleteProblem, getAllProblems, getSolvedProblems, getProblem, getAllSubmissions} = require('../controllers/problemController');


const problemRouter = express.Router();

// create , fetch, update , delete 

// only admin can post, put, delete
problemRouter.post("/", adminMiddleware, createProblem);
problemRouter.put("/:id", adminMiddleware, updateProblem);
problemRouter.delete("/:id", adminMiddleware, deleteProblem);

// all user can fetch problem
problemRouter.get("/", userMiddleware, getAllProblems);
problemRouter.get("/solved", userMiddleware, getSolvedProblems);
problemRouter.get("/:id", userMiddleware, getProblem);
problemRouter.get("/submissions/:id", userMiddleware, getAllSubmissions);

module.exports = problemRouter ;