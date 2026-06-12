import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SYSTEM_PROMPT = `
You are SafeHer AI, an emergency assistant and legal guide for women safety.
You will ONLY answer questions related to women safety, emergency protocols, self-defense tips, domestic violence laws, workplace harassment laws, and women's rights in India.
If the user asks ANYTHING else (e.g. coding, math, recipes, general chat, movies), you MUST reply exactly: "I cannot assist with that. I am trained exclusively for women safety and legal guidance."
Be concise, empathetic, and highly factual.
`;

// Simple chat history manager for single session
let chatHistory = [];

export const sendChatMessage = async (userMessage) => {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key not configured.");
    }

    // Append system prompt if this is the first message
    const prompt = chatHistory.length === 0 
      ? `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`
      : userMessage;

    // Start or continue chat
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.3, // Low temperature for factual safety advice
      },
    });

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    // Update history locally for context
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
    chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    return responseText;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Sorry, I am currently facing technical issues. Please contact emergency services if you are in danger.";
  }
};
