import dotenv from 'dotenv';

// Load env variables from the correct directory
dotenv.config();

const parseKey = (key) => {
  if (!key) return '';
  // Handle escaped newlines stored as literal \n in .env files
  return key.replace(/\\n/g, '\n');
};

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  env: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dsa_visualizer',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  cookieSecret: process.env.COOKIE_SECRET || 'fallback_cookie_secret_change_in_production',
  paseto: {
    privateKey: parseKey(process.env.PASETO_PRIVATE_KEY || ''),
    publicKey: parseKey(process.env.PASETO_PUBLIC_KEY || ''),
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    issuer: 'algoviz-api',
    audience: 'algoviz-client'
  },
  refreshToken: {
    privateKey: parseKey(process.env.REFRESH_TOKEN_PRIVATE_KEY || process.env.PASETO_PRIVATE_KEY || ''),
    publicKey: parseKey(process.env.REFRESH_TOKEN_PUBLIC_KEY || process.env.PASETO_PUBLIC_KEY || '')
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@algoviz.pro'
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    timeoutMs: parseInt(process.env.GROQ_TIMEOUT_MS || '30000', 10)
  }
};

/**
 * Validate critical configuration at startup.
 * In production, missing critical keys cause a hard failure to prevent
 * silently starting with a broken configuration.
 */
export function validateConfig() {
  const errors = [];

  if (config.env === 'production') {
    if (!process.env.PASETO_PRIVATE_KEY) errors.push('PASETO_PRIVATE_KEY is required in production');
    if (!process.env.PASETO_PUBLIC_KEY) errors.push('PASETO_PUBLIC_KEY is required in production');
    if (!process.env.MONGODB_URI) errors.push('MONGODB_URI is required in production');
    if (!process.env.REDIS_URL) errors.push('REDIS_URL is required in production');
    if (config.cookieSecret === 'fallback_cookie_secret_change_in_production') {
      errors.push('COOKIE_SECRET must be set to a strong random value in production');
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      errors.push('EMAIL_USER and EMAIL_PASS are required in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n  - ${errors.join('\n  - ')}`);
  }
}

export default config;
