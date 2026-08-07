const { createSubmission, getSubmission, getLanguageId, getstatusById } = require('../utils/judge0Utility');
const Problem = require('../models/problem');
const User = require('../models/user');
const mongoose = require('mongoose');
const Submission = require('../models/submission');

const encodeBase64 = (str) => {
    if (!str) return "";
    return Buffer.from(String(str), 'utf8').toString('base64');
};

// ==========================================
// HELPER FUNCTION: Validation & Judge0 Testing
// ==========================================
const validateAndTestProblem = async (problemData) => {
    const { title, description, referenceSolutions, hiddenTestCases, codeSnippets } = problemData;

    // Check basic required fields
    if (!title || !description || !referenceSolutions || referenceSolutions.length === 0) {
        return { isValid: false, error: "Missing required data or reference solutions." };
    }

    const testCases = (hiddenTestCases || []);
    if (testCases.length === 0) {
        return { isValid: false, error: "At least one hidden test case is required." };
    }

    if (!codeSnippets || codeSnippets.length === 0) {
        return { isValid: false, error: "At least one code snippet (with driver code) is required." };
    }

    // Prepare the code for Judge0
    const solution = referenceSolutions[0];
    let langId;
    try {
        langId = getLanguageId(solution.language.toLowerCase());
    } catch (err) {
        return { isValid: false, error: err.message };
    }

    // Find the matching driver code so we can run the test cases
    const matchingSnippet = codeSnippets.find(
        snippet => snippet.language.toLowerCase() === solution.language.toLowerCase()
    );

    if (!matchingSnippet) {
        return { isValid: false, error: `Missing driver code snippet for language: ${solution.language}` };
    }

    const fullCodeToTest = matchingSnippet.driverCode.replace("{{USER_CODE}}", solution.code);

    // Send to Judge0
    const submissionPayload = testCases.map(testCase => ({
        language_id: langId,
        source_code: encodeBase64(fullCodeToTest),
        stdin: encodeBase64(testCase.input),
        expected_output: encodeBase64(testCase.expectedOutput)
    }));

    try {
        const submitResult = await createSubmission(submissionPayload);
        const resultTokens = submitResult.map((elem) => (elem.token));
        const testResult = await getSubmission(resultTokens);

        for (const test of testResult) {
            if (test.status_id !== 3) { // 3 is "Accepted"
                return { isValid: false, error: "Reference Solution Error: " + getstatusById(test.status_id) };
            }
        }
    } catch (err) {
        return { isValid: false, error: "Judge0 validation failed: " + err.message };
    }

    // If we make it here, the problem is solvable and ready to save!
    return { isValid: true };
};


// ==========================================
// ADMIN CONTROLLERS (Create / Update / Delete)
// ==========================================
const createProblem = async (req, res) => {
    try {
        const validation = await validateAndTestProblem(req.body);
        
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.error });
        }

        const newProblem = await Problem.create({
            ...req.body,
            problemCreator: req.user._id
        });

        res.status(201).json({
            message: "Problem created and validated successfully",
            problem: newProblem
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to create problem: " + err.message });
    }
};

const updateProblem = async (req, res) => {
    const { id } = req.params;
    
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid problem ID." });
        }

        // Fetch the existing problem first
        const existingProblem = await Problem.findById(id);
        if (!existingProblem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        const mergedProblem = {
            ...existingProblem.toObject(),
            ...req.body
        };

        const validation = await validateAndTestProblem(mergedProblem);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.error });
        }

        const updatedProblem = await Problem.findByIdAndUpdate(id, { $set: req.body }, { runValidators: true, new: true });

        res.status(200).json({
            message: "Problem updated successfully", 
            problem: updatedProblem
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to update problem: " + err.message });
    }
};

const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }

        const deleted = await Problem.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Problem not found." });
        }

        res.status(200).json({ message: "Problem deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete problem: " + err.message });
    }
};

// ==========================================
// USER CONTROLLERS (Fetching / Viewing)
// ==========================================

const getProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        
        const fetchedProblem = await Problem.findById(id).select('-problemCreator -createdAt -updatedAt');

        if (!fetchedProblem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ problem: fetchedProblem });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch problem: " + err.message });
    }
};

const getAllProblems = async (req, res) => {
    try {
        const allProblems = await Problem.find({}).select('_id number title difficulty topics');
        res.status(200).json({ allProblems });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch problems: " + err.message });
    }
};

const getSolvedProblems = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: "problemsSolved",
            select: "_id number title difficulty topics"
        });

        res.status(200).json({
            solvedProblems: user.problemsSolved
        });

    } catch (err) {
        res.status(500).json({ message: "Failed to fetch solved problems: " + err.message });
    }
};

const getAllSubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;

        const allSubmissions = await Submission.find({ userId, problemId });

        res.status(200).json({
            submissions: allSubmissions
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to get past submissions: " + err.message });
    }
};

module.exports = { createProblem, updateProblem, deleteProblem, getAllProblems, getSolvedProblems, getProblem, getAllSubmissions };