import { setupEnvironment } from "./env";
import path from "path";
import { fileURLToPath } from "url";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Setup environment variables first
const env = setupEnvironment();
console.log("\n--- Environment Setup Debug ---");
console.log("Environment variables loaded:", env);
console.log("--- End Debug ---\n");

// Get the directory name properly with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === 'production') {
    // 生产环境下使用静态文件服务
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    
    // 所有未匹配的路由都返回 index.html（不是 index.js）
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'public/index.html'));
    });
  } else {
    // 开发环境下使用 Vite
    await setupVite(app, server);
  }

  const PORT = Number(process.env.PORT) || 3333;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
})();
