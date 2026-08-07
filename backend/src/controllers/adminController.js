const User = require('../models/user');
const Problem = require('../models/problem');
const Submission = require('../models/submission');

const getDashboardStats = async (req, res) => {
    try {
        const [userStats, problemStats, totalSubmissions, acceptedSubmissions] = await Promise.all([
            
            // Pipeline A: Group users by role
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]),
        
            // Pipeline B: Group problems by difficulty
            Problem.aggregate([
                { $group: { _id: "$difficulty", count: { $sum: 1 } } }
            ]),

            // Pipeline C: Submission metrics
            Submission.countDocuments(),
            
            Submission.countDocuments({ status: "Accepted" }) 
        ]);

        // --- Data Formatting & Transformation ---

        // Process User Demographics
        let totalUsers = 0;
        let adminUsers = 0;
        let standardUsers = 0;

        userStats.forEach(stat => {
            totalUsers += stat.count;
            if (stat._id === 'admin') {
                adminUsers = stat.count;
            } else {
                standardUsers += stat.count;
            }
        });

        // Process Problem Difficulty Distribution
        let totalProblems = 0;
        const difficulty = { easy: 0, medium: 0, hard: 0 };

        problemStats.forEach(stat => {
            totalProblems += stat.count;
            const level = stat._id ? stat._id.toLowerCase() : 'easy'; 
            if (difficulty[level] !== undefined) {
                difficulty[level] = stat.count;
            }
        });

        // Calculate Acceptance Rate
        let acceptanceRate = 0;
        if (totalSubmissions > 0) {
            acceptanceRate = parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1));
        }

        // --- Construct the Final Response Object ---
        const dashboardData = {
            metrics: {
                totalProblems,
                totalUsers,
                totalSubmissions
            },
            acceptanceRate,
            difficulty: {
                easy: difficulty.easy,
                medium: difficulty.medium,
                hard: difficulty.hard
            },
            demographics: {
                standard: standardUsers,
                admin: adminUsers
            }
        };

        return res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return res.status(500).json({ 
            message: "Failed to fetch dashboard statistics", 
            error: error.message 
        });
    }
};

module.exports = {
    getDashboardStats
};