import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is null or undefined. AI features will respond with simulated guidance.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST endpoints for the AI Copilot features
app.post("/api/copilot/chat", async (req, res) => {
  const { messages, currentFile, codeSelection } = req.body;

  try {
    if (!apiKey) {
      // Simulate Atom-like developer assistant response locally if no key is configured yet
      const lastMsg = messages[messages.length - 1]?.content || "";
      let responseText = "### ⚛️ Atom Assistant (Offline Mode)\n\n" +
        "To enable real Gemini powered responses, please click **Settings -> Secrets** to configure your `GEMINI_API_KEY` environment variable.\n\n" +
        "Here is a mock analysis of your request: *\"" + lastMsg.substring(0, 100) + "\"*\n\n" +
        "```javascript\n// Under active offline mode, you can read and write files\nconsole.log('Atom Core Online!');\n```";
      return res.json({ text: responseText });
    }

    const ai = getGeminiClient();
    const systemInstruction = 
      "You are the built-in AI Copilot backend for the Atom IDE clone. " +
      "Help the user edit, write, optimize, or review their code in a constructive, professional programmer style. " +
      "Keep responses crisp and return formatted Markdown with proper code block language syntaxes (like javascript, html, typescript, etc.). " +
      "Always take into account the current file name: " + (currentFile?.name || "none") + 
      (currentFile ? " and its contents:\n```\n" + currentFile.content + "\n```\n" : "") +
      (codeSelection ? " The user has highlighted this specific code block or selection:\n```\n" + codeSelection + "\n```" : "");

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: err.message || "Internal assistant error" });
  }
});

app.post("/api/copilot/autofix", async (req, res) => {
  const { fileName, fileContent, errorDetails } = req.body;

  try {
    if (!apiKey) {
      return res.json({
        fixedCode: fileContent,
        explanation: "In offline mode, please configure `GEMINI_API_KEY` in the secrets panel to run automated hotfixes with Gemini."
      });
    }

    const ai = getGeminiClient();
    const prompt = `Fix the errors/issues described here: "${errorDetails}". 
    Below are the contents of the file named "${fileName}":
    \`\`\`
    ${fileContent}
    \`\`\`
    Analyze and output a JSON response containing the properties 'fixedCode' and 'explanation'. Do not wrap the JSON output in markdown blocks, just return pure JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as any,
          properties: {
            fixedCode: { type: "STRING" as any, description: "The updated, bug-free entire code of the file." },
            explanation: { type: "STRING" as any, description: "A summary explaining what changes were made and why." }
          },
          required: ["fixedCode", "explanation"]
        }
      }
    });

    try {
      const resultObj = JSON.parse(response.text || "{}");
      res.json(resultObj);
    } catch (parseErr) {
      res.json({ fixedCode: fileContent, explanation: "Failed to parse API output, but contents were: " + response.text });
    }
  } catch (err: any) {
    console.error("Autofix Error:", err);
    res.status(500).json({ error: err.message || "An error occurred during auto-fixing." });
  }
});

// Setup Vite Dev Server / Static Ingress
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production build from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Atom Server listening at http://0.0.0.0:${PORT}`);
  });
}

start();
