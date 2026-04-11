import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    const { apiKey, messages, tools, tool_choice } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: { message: "API Key is required" } });
    }

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          tools,
          tool_choice
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("DeepSeek API Error Response:", JSON.stringify(data, null, 2));
        return res.status(response.status).json(data);
      }

      res.json(data);
    } catch (error) {
      console.error("DeepSeek Proxy Error:", error);
      res.status(500).json({ error: { message: error instanceof Error ? error.message : "Internal server error during AI request" } });
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
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files from dist
    app.use(express.static(distPath));

    // Specifically handle assets
    app.use('/assets', express.static(path.join(distPath, 'assets')));

    app.get('*', (req, res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
