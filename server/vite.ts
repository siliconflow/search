import { type Express } from "express";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  app.use(vite.middlewares);
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
