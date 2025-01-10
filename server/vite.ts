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
  // 使用 dist/client 作为静态文件目录
  const clientDist = path.resolve(process.cwd(), 'dist/client');
  
  // 检查目录是否存在
  if (!fs.existsSync(clientDist)) {
    console.warn(`Warning: ${clientDist} not found, creating directory...`);
    fs.mkdirSync(clientDist, { recursive: true });
  }

  app.use(express.static(clientDist));
  
  // 所有未匹配的路由返回 index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    const indexPath = path.join(clientDist, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.error(`Error: ${indexPath} not found`);
      return res.status(404).send('Not found');
    }
    
    res.sendFile(indexPath);
  });
}

export function log(message: string) {
  console.log(`[server] ${message}`);
}
