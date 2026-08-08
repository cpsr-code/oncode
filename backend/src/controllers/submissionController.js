const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');
const { getLanguageId, getstatusById, createSubmission, getSubmission } = require('../utils/judge0Utility'); 

const encodeBase64 = (str) => {
    if (!str) return "";
    return Buffer.from(String(str), 'utf8').toString('base64');
};

const decodeBase64 = (str) => {
    if (!str) return "";
    return Buffer.from(String(str), 'base64').toString('utf8');
};

// Helper to prevent giant strings from crashing the DB or UI
const truncateString = (str, maxLength = 2000) => {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "\n... [Output truncated due to length]";
};

// ==========================================
// SUBMIT CODE (Grades all hidden test cases)
// ==========================================
const submitCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            return res.status(400).json({ message: "Missing required field." });
        }

        const problem = await Problem.findById(problemId);
        if(!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        // Validate Language & Get Driver Code
        const snippet = problem.codeSnippets.find(s => s.language.toLowerCase() === language.toLowerCase());
        if (!snippet) {
            return res.status(400).json({ message: `Language '${language}' is not supported for this problem.` });
        }

        const testCases = problem.hiddenTestCases || [];
        // Create the initial pending submission (We store the pure user code in DB)
        const submittedResult = await Submission.create({
            userId, problemId, code, language,
            testCasesPassed: 0,
            status: 'Pending',
            testCasesTotal: testCases.length
        });

        const langId = getLanguageId(language.toLowerCase());
        

        const fullCodeToRun = snippet.driverCode.replace("{{USER_CODE}}", code);
        
        const compilerOptions = langId === 54 ? "-Wall -Werror=return-type" : "";
        
        const submissionPayload = testCases.map(testCase => ({
            language_id: langId,
            source_code: encodeBase64(fullCodeToRun),
            stdin: encodeBase64(testCase.input),
            expected_output: encodeBase64(testCase.expectedOutput),
            compiler_options: compilerOptions
        }));

        const submitResult = await createSubmission(submissionPayload);
        const resultTokens = submitResult.map(elem => elem.token);
        const testResult = await getSubmission(resultTokens);

        let totalRuntimeSeconds = 0;
        let maxMemoryKb = 0;
        let statusId = 3; // Default to Accepted
        let testCasesPassed = 0;
        let errorMessage = null;
        let failedTestCase = null;

        for (let i = 0; i < testResult.length; i++) {
            const test = testResult[i];

            if (test.status_id !== 3) {
                statusId = test.status_id;
                
                if (test.status_id === 4) { // Wrong Answer
                    failedTestCase = {
                        input: truncateString(testCases[i].input),
                        expectedOutput: truncateString(testCases[i].expectedOutput),
                        // 3. Truncate actual output to protect DB
                        actualOutput: truncateString(decodeBase64(test.stdout))
                    };
                } else { // Compilation or Runtime Errors
                    const rawError = decodeBase64(test.compile_output) || decodeBase64(test.stderr) || "Execution failed without error message.";
                    errorMessage = truncateString(rawError);
                }
                break; // Stop grading after the first failure
            }

            totalRuntimeSeconds += parseFloat(test.time || 0);
            maxMemoryKb = Math.max(maxMemoryKb, test.memory || 0);
            testCasesPassed++;
        }

        submittedResult.status = getstatusById(statusId);
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.failedTestCase = failedTestCase;
        submittedResult.runtime = Math.round(totalRuntimeSeconds * 1000);
        submittedResult.memory = parseFloat((maxMemoryKb / 1024).toFixed(1));

        await submittedResult.save();

        if(statusId === 3){
            await User.findByIdAndUpdate(userId, {
                $addToSet: { problemsSolved: problemId } 
            });
        }

        res.status(201).json({
            message: "Submission completed.",
            submissionResult: submittedResult
        });
    } catch(err) {
        res.status(500).json({ message: "Failed to submit code: " + err.message });
    }
};

// ==========================================
// RUN CODE (Tests only the visible test case)
// ==========================================
const runCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            return res.status(400).json({ message: "Some fields are missing" });
        }

        const problem = await Problem.findById(problemId);
        if(!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        // Validate Language & Get Driver Code
        const snippet = problem.codeSnippets.find(s => s.language.toLowerCase() === language.toLowerCase());
        if (!snippet) {
            return res.status(400).json({ message: `Language '${language}' is not supported for this problem.` });
        }
        
        const testCase = problem.visibleTestCase;
        const langId = getLanguageId(language.toLowerCase());
        
        const fullCodeToRun = snippet.driverCode.replace("{{USER_CODE}}", code);
        
        const compilerOptions = langId === 54 ? "-Wall -Werror=return-type" : "";

        const submissionPayload = [{
            language_id: langId,
            source_code: encodeBase64(fullCodeToRun), // Send glued code!
            stdin: encodeBase64(testCase.input),
            expected_output: encodeBase64(testCase.expectedOutput),
            compiler_options: compilerOptions
        }];
        
        const submitResult = await createSubmission(submissionPayload);
        const testResult = await getSubmission([submitResult[0].token]);
        const result = testResult[0];
        
        res.status(200).json({
            message: "Run completed.",
            status: getstatusById(result.status_id),
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: truncateString(decodeBase64(result.stdout)),
            errorMessage: truncateString(decodeBase64(result.compile_output) || decodeBase64(result.stderr) || ""),
            runtime: result.time ? Math.round(parseFloat(result.time) * 1000) : 0,
            memory: result.memory ? (result.memory / 1024).toFixed(1) : 0
        });

    } catch(error) {
        res.status(500).json({ message: "Failed to run code: " + error.message });
    }
};

module.exports = { submitCode, runCode };