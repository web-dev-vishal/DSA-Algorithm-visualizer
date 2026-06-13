import paseto from 'paseto';
import crypto from 'crypto';
import config from '../config/index.js';
import { UnauthorizedError } from '../errors/ApiError.js';

const { V4 } = paseto;

const ISSUER = config.paseto.issuer;
const AUDIENCE = config.paseto.audience;

let devKeys = null;

function getDevKeys() {
  if (!devKeys) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    devKeys = { publicKey, privateKey };
  }
  return devKeys;
}

/**
 * Convert a PEM string to a Node.js private key object.
 * @param {string} pemString 
 * @returns {import('crypto').KeyObject}
 */
function getPrivateKey(pemString) {
  if (!pemString) {
    if (config.env === 'production') {
      throw new Error('PASETO private key is not configured. Set PASETO_PRIVATE_KEY in .env');
    }
    return crypto.createPrivateKey(getDevKeys().privateKey);
  }
  return crypto.createPrivateKey(pemString);
}

/**
 * Convert a PEM string to a Node.js public key object.
 * @param {string} pemString
 * @returns {import('crypto').KeyObject}
 */
function getPublicKey(pemString) {
  if (!pemString) {
    if (config.env === 'production') {
      throw new Error('PASETO public key is not configured. Set PASETO_PUBLIC_KEY in .env');
    }
    return crypto.createPublicKey(getDevKeys().publicKey);
  }
  return crypto.createPublicKey(pemString);
}

export class PasetoService {
  /**
   * Generates a short-lived access token signed with the access keypair.
   * @param {Object} payload - Claims to embed in the token
   * @returns {Promise<string>}
   */
  static async generateAccessToken(payload) {
    try {
      const privateKey = getPrivateKey(config.paseto.privateKey);
      return await V4.sign(payload, privateKey, {
        expiresIn: config.paseto.accessTokenExpiry,
        issuer: ISSUER,
        audience: AUDIENCE
      });
    } catch (err) {
      throw new Error(`Failed to generate access token: ${err.message}`);
    }
  }

  /**
   * Verifies an access token and returns the decoded payload.
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  static async verifyAccessToken(token) {
    try {
      const publicKey = getPublicKey(config.paseto.publicKey);
      return await V4.verify(token, publicKey, {
        issuer: ISSUER,
        audience: AUDIENCE
      });
    } catch (err) {
      throw new UnauthorizedError(`Invalid or expired access token`);
    }
  }

  /**
   * Generates a long-lived refresh token signed with the refresh keypair.
   * Falls back to the access keypair if refresh keys are not configured separately.
   * @param {Object} payload 
   * @returns {Promise<string>}
   */
  static async generateRefreshToken(payload) {
    try {
      // Use refresh-specific key if configured, otherwise fall back to access key
      const keyPem = config.refreshToken.privateKey || config.paseto.privateKey;
      const privateKey = getPrivateKey(keyPem);
      return await V4.sign(payload, privateKey, {
        expiresIn: config.paseto.refreshTokenExpiry,
        issuer: ISSUER,
        audience: AUDIENCE
      });
    } catch (err) {
      throw new Error(`Failed to generate refresh token: ${err.message}`);
    }
  }

  /**
   * Verifies a refresh token and returns the decoded payload.
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  static async verifyRefreshToken(token) {
    try {
      const keyPem = config.refreshToken.publicKey || config.paseto.publicKey;
      const publicKey = getPublicKey(keyPem);
      return await V4.verify(token, publicKey, {
        issuer: ISSUER,
        audience: AUDIENCE
      });
    } catch (err) {
      throw new UnauthorizedError(`Invalid or expired refresh token`);
    }
  }
}

export default PasetoService;
