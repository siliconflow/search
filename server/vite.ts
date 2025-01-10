import { type Express } from "express";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import viteConfig from '../vite.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
      watch: {
        usePolling: false,
        ignored: ['**/*.timestamp-*.mjs']
      }
    },
    root: path.resolve(__dirname, '../client'),
    appType: 'custom'
  });
  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const template = await fs.promises.readFile(
        path.resolve(__dirname, "..", "client", "index.html"),
        "utf-8"
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const clientDist = path.resolve(process.cwd(), 'dist/client');
  
  // 检查目录是否存在
  if (!fs.existsSync(clientDist)) {
    console.warn(`Warning: ${clientDist} not found, creating directory...`);
    fs.mkdirSync(clientDist, { recursive: true });
  }

  app.use(express.static(clientDist));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    const indexPath = path.join(clientDist, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return next();
    }
    
    res.sendFile(indexPath);
  });
}

export function log(message: string) {
  console.log(`[server] ${message}`);
}
