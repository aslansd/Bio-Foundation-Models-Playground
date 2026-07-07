import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in AI Studio Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API endpoint for model emulation
app.post("/api/predict", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { modelId, input, history = [] } = req.body;

    if (!modelId || !input) {
      res.status(400).json({ error: "Missing modelId or input parameter." });
      return;
    }

    const ai = getAiClient();

    // Find model metadata to build the system instructions
    const modelSystemInstructions = `
      You are an advanced life sciences AI simulation backend. Your task is to accurately emulate the exact prediction outputs or chat responses of a specific open-source life sciences foundation model: "${modelId}".

      --- MODEL METADATA ---
      Model ID: ${modelId}
      
      --- TARGET EMULATION BEHAVIOR ---
      1. If the model is a Sequence / Structural / Property model (e.g., ESM-2, DNABERT-2, HyenaDNA, Nucleotide Transformer, RNA-FM, Geneformer, ChemBERTa-2, Molformer):
         - You must analyze the input (a sequence of DNA, RNA, amino acids, gene list, or a SMILES chemical string).
         - Provide a highly technical, rigorous, and scientifically realistic analysis.
         - Format the response as a structured report with markdown.
         - Include sections such as:
           - **Sequence/Structure Metadata**: (e.g. length, molecular weights, GC ratio, amino acid composition, or SMILES valence).
           - **Functional Site Predictions**: (e.g. active pocket positions, promoter sequence markers, splicing locations, splice junctions, or toxicity indicators with confidence levels).
           - **Physical/Chemical Properties**: (e.g. secondary structure prediction in helical/sheet segments, aqueous solubility, toxicity screening).
           - **Attention Weights Analysis**: Emulate how transformer attention heads focus on specific residues, motifs, or sub-structures (provide a small text-based table or list with weights between 0.0 and 1.0).
         - NEVER speak in a generic chatbot voice for sequence models. Speak strictly as a scientific inference engine reporting numerical and functional outputs.

      2. If the model is a Biomedical LLM / Conversational model (e.g., BioGPT, BioMedLM, Meditron, PMC-LLaMA):
         - Respond exactly in the persona, focus, and literature-backed style of that specific model.
         - **BioGPT**: Highlight gene-disease relationships, biomedical relation extractions, and mechanistic pathways with Microsoft Research-level biological precision.
         - **BioMedLM**: Focus on academic PubMed abstract style, highly structured medical reasoning, clinical terminologies, and study summaries.
         - **Meditron**: Adopt the persona of a SOTA clinical assistant aligned with WHO, ACC/AHA clinical guidelines, medical textbooks, and differential diagnosis frameworks. Emphasize patient safety and structured diagnostic protocols.
         - **PMC-LLaMA**: Act as an academic research assistant with deep understanding of PMC papers, citing experimental procedures, CRISPR/Cas9 molecular mechanisms, or clinical trials in a scholarly tone.
         - You should respond directly to the chat input while respecting the conversation history provided.

      Keep all responses grounded, highly educational, and scientifically detailed. Do not include meta-commentary about Gemini. Talk as if you ARE the backend server of that exact model.
    `;

    // Handle conversational vs sequence models
    const isChatModel = ["biogpt", "biomedlm", "meditron", "pmcllama"].includes(modelId);

    if (isChatModel) {
      // Build a multi-turn chat
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: modelSystemInstructions,
          temperature: 0.7,
        }
      });

      // Synchronize the history
      // Express history array structure: [ { role: 'user' | 'model', parts: [ { text: string } ] } ]
      if (history && history.length > 0) {
        // We can pre-populate the chat history. The @google/genai SDK chats.create can take history inside config or we can just send the message.
        // Let's pass the message with history embedded in the prompt or let the SDK handle it.
        // To be safe and compliant, we can construct the full conversation inside the prompt, or pass history in chats.create.
        // Let's create a single prompt representing the history + current message to keep it simple, robust, and reliable.
        let promptWithHistory = "Here is our previous discussion for context:\n\n";
        history.forEach((h: any) => {
          const roleLabel = h.role === "user" ? "User" : "Model";
          promptWithHistory += `${roleLabel}: ${h.parts[0]?.text}\n\n`;
        });
        promptWithHistory += `Current Question:\nUser: ${input}\n\nModel response:`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptWithHistory,
          config: {
            systemInstruction: modelSystemInstructions,
            temperature: 0.7,
          }
        });

        res.json({ text: response.text });
      } else {
        const response = await chat.sendMessage({ message: input });
        res.json({ text: response.text });
      }
    } else {
      // Sequence models (single inference report)
      const prompt = `Perform inference simulation for the model "${modelId}" on the following input: \n\n\`\`\`\n${input}\n\`\`\``;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: modelSystemInstructions,
          temperature: 0.2, // low temperature for consistent, scientific structure
        }
      });

      res.json({ text: response.text });
    }
  } catch (error: any) {
    console.error("Error in model prediction endpoint:", error);
    res.status(500).json({ error: error.message || "An error occurred during emulation." });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
