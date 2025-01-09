import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

export function setupEnvironment() {
  // 在非生产环境下尝试加载 .env 文件
  if (process.env.NODE_ENV !== 'production') {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.warn(`Warning: ${envPath} not found, using process.env`);
    }
  }

  // 返回必要的环境变量，使用 process.env 作为后备
  return {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    HTTPS_PROXY: process.env.HTTPS_PROXY || '',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
}
