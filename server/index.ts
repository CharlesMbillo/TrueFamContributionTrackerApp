import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Simple logging function
function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom static serving function
function serveStaticFiles(app: express.Express) {
  const distPath = resolve(__dirname, '../dist/public');
  
  // Production: Serve built assets
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Only serve index.html for non-API routes
      if (!req.path.startsWith('/api')) {
        res.sendFile(resolve(distPath, 'index.html'));
      } else {
        res.status(404).end();
      }
    });
    return;
  }

  // Development: Let Vite handle frontend, show message for non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(404).send('Development server: Start frontend with "npm run dev" or build with "npm run build"');
    } else {
      res.status(404).end();
    }
  });
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // For development, we'll use static serving for now
    // The actual Vite dev server setup is handled separately
    serveStaticFiles(app);
  } else {
    serveStaticFiles(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();