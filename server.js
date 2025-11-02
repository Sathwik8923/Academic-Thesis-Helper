// server.js 
// -----------------------------------------------------------
// BACKEND: Securely handles the two-step AI workflow
// -----------------------------------------------------------

require('dotenv').config(); 

const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const app = express();
const port = 3000;

// Initialize GoogleGenAI client securely
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY, 
});

// Middleware
app.use(express.static('public')); 
app.use(express.json()); 

// --- ENDPOINT 1: Generate Thesis Outline (/api/generate-outline) ---
app.post('/api/generate-outline', async (req, res) => {
    try {
        const { topic, keywords } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required.' });
        }

        const systemInstruction = `
            You are an expert Academic Assistant. Your task is to generate a formal, multi-level thesis outline.
            The outline MUST include: I. Introduction, several Body Sections (II, III, etc.) with sub-points (A, B, C, etc.), and a Final Conclusion.
            Use the provided topic and keywords to structure your response.
            Format the output strictly as plain, readable text (markdown list format is acceptable, but ensure clear numbering/lettering). 
            Do NOT include any extra introductory or concluding remarks. Just the outline.
        `;

        const userPrompt = `
            Generate a thesis outline for the topic: "${topic}"
            Focus areas (keywords): ${keywords || 'none specified'}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3 // Keeps the outline focused and structured
            }
        });

        res.json({ outline: response.text, mainTopic: topic });

    } catch (error) {
        console.error('Outline Generation Error:', error.message);
        res.status(500).json({ error: 'Failed to generate outline. Check API Key and server logs.' });
    }
});

// --- ENDPOINT 2: Draft Specific Section (/api/draft-section) ---
app.post('/api/draft-section', async (req, res) => {
    try {
        const { fullOutline, sectionTitle, mainTopic } = req.body;
        
        if (!fullOutline || !sectionTitle || !mainTopic) {
            return res.status(400).json({ error: 'Missing required context for drafting.' });
        }

        const systemInstruction = `
            You are an Academic Writer. Your goal is to write a single, detailed, and highly focused paragraph that serves as a specific section of a larger academic thesis.
            The writing MUST be formal, objective, and adhere strictly to the academic style.
            Use the provided full thesis outline and main topic as context to ensure the paragraph fits coherently into the overall structure.
            Do NOT include a title for the section or any other surrounding text. Just the drafted paragraph.
        `;

        const userPrompt = `
            Main Thesis Topic: ${mainTopic}
            Full Thesis Outline (Context): 
            ---
            ${fullOutline}
            ---
            
            Now, draft a single, detailed paragraph ONLY for this specific section title: "${sectionTitle}"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5 
            }
        });

        res.json({ draft: response.text });

    } catch (error) {
        console.error('Draft Generation Error:', error.message);
        res.status(500).json({ error: 'Failed to draft section. Check API Key and server logs.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Academic Helper Server running on http://localhost:${port}`);
});