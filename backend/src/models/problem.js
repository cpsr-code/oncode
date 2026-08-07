const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  number: {
    type: Number,
    unique: true
  },
  topics: { 
    type: [String], 
    required: true, 
  },
  description: {
    type: String, 
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Easy'
  },
  
  // The Driver Code Architecture
  codeSnippets: [{
    language: { type: String, required: true },
    userSnippet: { type: String, required: true }, 
    driverCode: { type: String, required: true }  
  }],

  referenceSolutions: [{
    language: { type: String, required: true }, 
    code: { type: String, required: true }
  }],

  constraints: {
    type: [String],
    required: true,
    default: []
  },

  visibleTestCase: {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true }
  },
  
  // Hidden test cases for Judge0
  hiddenTestCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true }
    }
  ],

  // Examples shown on the problem page
  examples: [
    {
      input: { type: String, required: true }, 
      output: { type: String, required: true },
      explanation: { type: String }
    }
  ],

  problemCreator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  }
}, { timestamps: true });

problemSchema.pre('save', async function() {
    if (this.isNew && this.number == null) {
        const lastProblem = await this.constructor.findOne({}, 'number').sort('-number');
        this.number = lastProblem && lastProblem.number ? lastProblem.number + 1 : 1;
    }
});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;