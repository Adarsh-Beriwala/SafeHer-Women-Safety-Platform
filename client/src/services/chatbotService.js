import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are SafeHer AI, a women's safety assistant. Your role is to provide calm, clear, and actionable safety advice.

Guidelines:
- Always respond with practical, step-by-step safety instructions
- Keep responses concise but thorough (3-5 bullet points max)
- Include relevant Indian emergency numbers when appropriate:
  • Police: 100
  • Women Helpline: 1091 / 181
  • Ambulance: 108
  • Child Helpline: 1098
- Never give medical advice — redirect to professionals
- Be empathetic, calm, and reassuring
- Focus on de-escalation techniques and personal safety
- If the situation is immediately dangerous, prioritize: 1) Get to safety, 2) Alert contacts, 3) Call emergency services
- Always remind the user they can use the SOS button on SafeHer for immediate help`;

let chatSession = null;

const initChat = () => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key') {
    return null;
  }
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  chatSession = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: 'You are SafeHer AI safety assistant. Acknowledge you understand your role.' }],
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I am SafeHer AI, your personal safety assistant. I\'m here to provide calm, actionable safety advice whenever you need it. How can I help you stay safe?' }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
    },
  });

  return chatSession;
};

export const sendMessage = async (message) => {
  try {
    if (!chatSession) {
      chatSession = initChat();
    }

    if (!chatSession) {
      // API key not configured, return fallback
      return getFallbackResponse(message);
    }

    const prompt = `${SYSTEM_PROMPT}\n\nUser message: ${message}`;
    const result = await chatSession.sendMessage(prompt);
    const response = result.response.text();
    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackResponse(message);
  }
};

const getFallbackResponse = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes('follow') || lower.includes('stalk')) {
    return `🚨 **If you're being followed:**\n\n1. **Don't go home** — head to a crowded, well-lit place (mall, police station, hospital)\n2. **Call someone** — stay on the phone or pretend to be on a call\n3. **Change your route** — make unexpected turns to confirm you're being followed\n4. **Enter a shop** — ask staff for help, explain the situation\n5. **Use SafeHer SOS** if you feel in immediate danger\n\n📞 Women Helpline: **1091** | Police: **100**`;
  }

  if (lower.includes('harass') || lower.includes('bother')) {
    return `🛡️ **Dealing with harassment:**\n\n1. **Speak firmly** — Say "STOP" or "LEAVE ME ALONE" loudly\n2. **Create distance** — Move to a crowded area immediately\n3. **Document** — Note the person's description, time, location\n4. **Seek help** — Approach other women or families nearby\n5. **Report it** — Call Women Helpline: **181** or Police: **100**\n\n💡 You can trigger SafeHer's SOS button for immediate assistance.`;
  }

  if (lower.includes('unsafe') || lower.includes('danger') || lower.includes('scared') || lower.includes('afraid')) {
    return `💛 **Feeling unsafe? Here's what to do:**\n\n1. **Stay calm** — Take deep breaths to think clearly\n2. **Move to safety** — Find a well-lit, public area\n3. **Alert someone** — Call a trusted contact or use SafeHer SOS\n4. **Share location** — Use live tracking to keep contacts informed\n5. **Trust your instincts** — If something feels wrong, act on it\n\n📞 Emergency: **112** | Women Helpline: **1091**`;
  }

  return `🤖 **SafeHer AI is here to help!**\n\nI can help you with:\n- What to do if you're being followed\n- How to handle harassment\n- Safety tips for traveling alone\n- Emergency contact information\n- De-escalation techniques\n\n📞 **Emergency Numbers:**\n- Police: **100**\n- Women Helpline: **1091 / 181**\n- Ambulance: **108**\n\nPlease describe your situation and I'll provide specific safety advice.`;
};

export const resetChat = () => {
  chatSession = null;
};
