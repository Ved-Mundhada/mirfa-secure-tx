import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; 
const KEY_LENGTH = 32; 

export interface EncryptedEnvelope {
  payload_nonce: string;
  payload_ct: string;
  payload_tag: string;
  dek_wrap_nonce: string;
  dek_wrapped: string;
  dek_wrap_tag: string;
}

export function encryptEnvelope(data: any, masterKeyHex: string): EncryptedEnvelope {
  if (masterKeyHex.length !== 64) throw new Error("Master Key must be 32 bytes (64 hex chars)");
  
  const masterKey = Buffer.from(masterKeyHex, 'hex');
  const dek = randomBytes(KEY_LENGTH);

  const payloadIv = randomBytes(IV_LENGTH);
  const payloadCipher = createCipheriv(ALGORITHM, dek, payloadIv);
  
  let payloadEncrypted = payloadCipher.update(JSON.stringify(data), 'utf8', 'hex');
  payloadEncrypted += payloadCipher.final('hex');
  const payloadTag = payloadCipher.getAuthTag().toString('hex');

  // 2. Encrypting
  const dekIv = randomBytes(IV_LENGTH);
  const dekCipher = createCipheriv(ALGORITHM, masterKey, dekIv);
  
  let dekEncrypted = dekCipher.update(dek).toString('hex');
  dekEncrypted += dekCipher.final('hex');
  const dekTag = dekCipher.getAuthTag().toString('hex');

  return {
    payload_nonce: payloadIv.toString('hex'),
    payload_ct: payloadEncrypted,
    payload_tag: payloadTag,
    dek_wrap_nonce: dekIv.toString('hex'),
    dek_wrapped: dekEncrypted,
    dek_wrap_tag: dekTag
  };
}

export function decryptEnvelope(envelope: EncryptedEnvelope, masterKeyHex: string): any {
  const masterKey = Buffer.from(masterKeyHex, 'hex');

  // 1. Decrypting
  const dekDecipher = createDecipheriv(ALGORITHM, masterKey, Buffer.from(envelope.dek_wrap_nonce, 'hex'));
  dekDecipher.setAuthTag(Buffer.from(envelope.dek_wrap_tag, 'hex'));
  
  const dekPart1 = dekDecipher.update(envelope.dek_wrapped, 'hex');
  const dekPart2 = dekDecipher.final();
  const dek = Buffer.concat([dekPart1, dekPart2]);

  const payloadDecipher = createDecipheriv(ALGORITHM, dek, Buffer.from(envelope.payload_nonce, 'hex'));
  payloadDecipher.setAuthTag(Buffer.from(envelope.payload_tag, 'hex'));

  let decrypted = payloadDecipher.update(envelope.payload_ct, 'hex', 'utf8');
  decrypted += payloadDecipher.final('utf8');

  return JSON.parse(decrypted);
}