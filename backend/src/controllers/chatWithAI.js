const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatWithAI = async (req, res) => {
    try {   
        const { problemTitle, problemDescription, userLanguage, userCode, userQuestion } = req.body;

        if (!userQuestion || !userCode) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Truncate inputs to protect your token limits and wallet
        const safeQuestion = userQuestion.substring(0, 1000); // Max 1000 characters
        const safeCode = userCode.substring(0, 5000);         // Max ~5000 characters
        
        //Provide fallbacks so we don't send "undefined" to the AI
        const safeTitle = problemTitle || "Unknown Problem";
        const safeLanguage = userLanguage || "code";
        // Truncate description
        const safeDescription = problemDescription ? problemDescription.substring(0, 2000) : "No description provided.";

        // The Data Plane: Combine the necessary world state safely
        const worldStateContext = `
            PROBLEM: ${safeTitle}
            DESCRIPTION: ${safeDescription}
            
            USER'S CODE (${safeLanguage}):
            \`\`\`${safeLanguage}
            ${safeCode}
            \`\`\`
            
            USER'S QUESTION:
            ${safeQuestion}
        `;

        // The API Call
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                // The Control Plane
                systemInstruction: `You are an expert programming tutor. 
                Your goal is to help students understand their mistakes.
                RULES:
                - DO NOT provide the complete working solution.
                - Point out logical flaws or syntax errors in their current code.
                - Provide hints or analyze time/space complexity.
                - Keep your response concise and formatted in Markdown.`
            },
            // The Data Plane
            contents: worldStateContext,
        });

        // Return the single response to the frontend
        res.status(200).json({ reply: response.text });

    } catch (error) {
        console.error("Error generating AI response:", error);
        res.status(500).json({ message: "Failed to generate AI response." });
    }
};

module.exports = chatWithAI;