// config/index.ts (yaxud config.ts)

interface AppConfig {
  apiBaseUrl: string;
  // Gələcəkdə digər konfiqurasiyaları bura əlavə edə bilərsiniz
}

const config: AppConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api', // Default dəyər təyin edirik
};

export default config;