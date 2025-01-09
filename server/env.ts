import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

export function setupEnvironment() {
  try {
    // 尝试加载 .env 文件，但不抛出错误
    dotenv.config({ path: envPath });
  } catch (error) {
    console.warn('无法加载 .env 文件，将使用环境变量');
  }

  // 确保在 Vercel 环境中使用环境变量
  const env = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    HTTPS_PROXY: process.env.HTTPS_PROXY || '',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  // 输出调试信息
  console.log('Environment loaded:', {
    ...env,
    GOOGLE_API_KEY: env.GOOGLE_API_KEY ? '已设置' : '未设置',
  });

  return env;
}
