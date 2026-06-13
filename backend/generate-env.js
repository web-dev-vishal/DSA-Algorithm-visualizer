import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateEd25519Keys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  return {
    privateKey: privateKey.trim().replace(/\n/g, '\\n'),
    publicKey: publicKey.trim().replace(/\n/g, '\\n')
  };
}

function generateRandomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

function main() {
  const envPath = path.join(__dirname, '.env');
  const examplePath = path.join(__dirname, '.env.example');

  if (fs.existsSync(envPath)) {
    console.log('.env file already exists. Skipping generation.');
    return;
  }

  if (!fs.existsSync(examplePath)) {
    console.error('.env.example not found at ' + examplePath);
    process.exit(1);
  }

  console.log('Generating fresh Ed25519 keys for PASETO and writing .env...');
  const accessKeys = generateEd25519Keys();
  const refreshKeys = generateEd25519Keys();
  const cookieSecret = generateRandomHex(32);

  let exampleContent = fs.readFileSync(examplePath, 'utf8');

  exampleContent = exampleContent
    .replace('replace_with_a_secure_cookie_secret_at_least_32_chars_long', cookieSecret)
    .replace('"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"', `"${accessKeys.privateKey}"`)
    .replace('"-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----"', `"${accessKeys.publicKey}"`)
    .replace('REFRESH_TOKEN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"', `REFRESH_TOKEN_PRIVATE_KEY="${refreshKeys.privateKey}"`)
    .replace('REFRESH_TOKEN_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----"', `REFRESH_TOKEN_PUBLIC_KEY="${refreshKeys.publicKey}"`);

  fs.writeFileSync(envPath, exampleContent, 'utf8');
  console.log('Successfully created secure .env file!');
}

main();
