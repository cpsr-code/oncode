const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        problemId: {
            type: Schema.Types.ObjectId,
            ref: 'Problem',
            required: true
        },
        code: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true,
            enum: ['cpp', 'java'],
        },
        status: {
            type: String,
        },
        runtime: {
            type: Number, // ms
            default: 0
        },
        memory: {
            type: Number, // mb
            default: 0
        },
        errorMessage: {
            type: String,
            default: ''
        },
        testCasesPassed: {
            type: Number,
            default: 0
        },
        testCasesTotal: {
            type: Number,
            default: 0
        },
        failedTestCase: {
            input: { type: String },
            expectedOutput: { type: String },
            actualOutput: { type: String }
        },
    },
     {timestamps: true}
)

submissionSchema.index({userId:1, problemId:1});
const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission ;