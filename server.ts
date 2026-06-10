import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

let aiClient: OpenAI | null = null;

function getAIClient(): OpenAI {
  if (!aiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY environment variable is missing.");
    }
    aiClient = new OpenAI({
      apiKey: key,
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API constraints for triage
  app.post("/api/triage", async (req, res) => {
    try {
      const { history, message, userProfile } = req.body;
      
      let profileContext = "";
      if (userProfile && typeof userProfile === 'object') {
        profileContext = `
USER'S MEDICAL PROFILE (use this context to tailor advice, do not ask for info already provided here):
- Age: ${userProfile.age || 'Unknown'}
- Gender: ${userProfile.gender || 'Unknown'}
- Medical Conditions: ${(userProfile.medicalConditions || []).join(', ') || 'None reported'}
- Medications: ${(userProfile.medications || []).join(', ') || 'None reported'}
`;
      }
      
      let conversationContext = "Previous conversation:\\n";
      if (history && history.length > 0) {
        for (const msg of history) {
          conversationContext += `[${msg.role}]: ${msg.text}\n`;
        }
        conversationContext += `${profileContext}\n[user]: ${message}\n\nRespond to the user's latest message based on the history above.`;
      } else {
        conversationContext = `${profileContext}\n[user]: ${message}`;
      }

      const ai = getAIClient();
      const completion = await ai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an emergency first-aid triage assistant. 
Your goal is to guide the user in performing correct first aid for ANY medical condition or symptom they report.
Instead of giving a blanket solution immediately, FIRST ask 1 or 2 essential, short clarifying questions (like patient's age, state of consciousness, breathing status, or severity).
Provide 2-4 likely 'quick replies' the user might want to choose from as buttons.
Once you have enough information to feel confident, provide a clear, step-by-step action plan.
If the situation sounds life-threatening (unconscious, not breathing, severe bleeding), IMMEDIATELY instruct them to call an ambulance and provide the critical action plan.

Also, if the situation requires medical attention after first aid, suggest a facility by setting the "recommendedFacility" field to "hospital", "clinic", or "pharmacy". Set it to null if no facility visit is required yet.

Return your response in strict JSON format EXACTLY matching this structure:
{
  "text": "The message to show to the user (Markdown supported).",
  "quickReplies": ["Option 1", "Option 2"],
  "status": "questioning or action_plan",
  "recommendedFacility": "hospital or pharmacy or clinic or null"
}`
          },
          {
            role: "user",
            content: conversationContext
          }
        ],
        response_format: { type: "json_object" }
      });

      const jsonStr = completion.choices[0].message.content || "{}";
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
