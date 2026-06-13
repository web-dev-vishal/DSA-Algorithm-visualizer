import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();

const parseKey = (key) => {
  if (!key) return '';
  // Handle newlines in env variables
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
    privateKey: parseKey(process.env.PASETO_PRIVATE_KEY),
    publicKey: parseKey(process.env.PASETO_PUBLIC_KEY),
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
  },
  refreshToken: {
    privateKey: parseKey(process.env.REFRESH_TOKEN_PRIVATE_KEY),
    publicKey: parseKey(process.env.REFRESH_TOKEN_PUBLIC_KEY)
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@algoviz.pro'
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || ''
  }
};

// Simple validations
if (config.env === 'production') {
  if (!process.env.PASETO_PRIVATE_KEY || !process.env.PASETO_PUBLIC_KEY) {
    console.warn('WARNING: PASETO keypairs are missing in production!');
  }
  if (config.cookieSecret === 'fallback_cookie_secret_change_in_production') {
    console.warn('WARNING: Using default cookie secret in production!');
  }
}

export default config;
