import paseto from 'paseto';
import crypto from 'crypto';
import config from '../config/index.js';
import { UnauthorizedError } from '../errors/ApiError.js';

const { V4 } = paseto;

// Helper to convert PEM string to key object
const getPrivateKeyObject = (pemString) => {
  if (!pemString) throw new Error('PASETO Private Key is not configured');
  return crypto.createPrivateKey(pemString);
};

const getPublicKeyObject = (pemString) => {
  if (!pemString) throw new Error('PASETO Public Key is not configured');
  return crypto.createPublicKey(pemString);
};

export class PasetoService {
  /**
   * Generates a short-lived access token
   * @param {Object} payload 
   * @returns {Promise<string>}
   */
  static async generateAccessToken(payload) {
    try {
      const privateKey = getPrivateKeyObject(config.paseto.privateKey);
      return await V4.sign(payload, privateKey, {
        expiresIn: config.paseto.accessTokenExpiry,
        issuer: 'algoviz-api',
        audience: 'algoviz-client'
      });
    } catch (err) {
      throw new Error(`Failed to generate access token: ${err.message}`);
    }
  }

  /**
   * Verifies an access token
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  static async verifyAccessToken(token) {
    try {
      const publicKey = getPublicKeyObject(config.paseto.publicKey);
      return await V4.verify(token, publicKey, {
        issuer: 'algoviz-api',
        audience: 'algoviz-client'
      });
    } catch (err) {
      throw new UnauthorizedError(`Invalid or expired access token: ${err.message}`);
    }
  }

  /**
   * Generates a long-lived refresh token
   * @param {Object} payload 
   * @returns {Promise<string>}
   */
  static async generateRefreshToken(payload) {
    try {
      const privateKey = getPrivateKeyObject(config.configName === 'test' ? config.paseto.privateKey : config.refreshToken.privateKey);
      return await V4.sign(payload, privateKey, {
        expiresIn: config.paseto.refreshTokenExpiry,
        issuer: 'algoviz-api',
        audience: 'algoviz-client'
      });
    } catch (err) {
      throw new Error(`Failed to generate refresh token: ${err.message}`);
    }
  }

  /**
   * Verifies a refresh token
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  static async verifyRefreshToken(token) {
    try {
      const publicKey = getPublicKeyObject(config.configName === 'test' ? config.paseto.publicKey : config.refreshToken.publicKey);
      return await V4.verify(token, publicKey, {
        issuer: 'algoviz-api',
        audience: 'algoviz-client'
      });
    } catch (err) {
      throw new UnauthorizedError(`Invalid or expired refresh token: ${err.message}`);
    }
  }
}
export default PasetoService;
