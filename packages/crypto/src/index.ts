import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const KEY_LENGTH = 32; // Standard for AES-256

export interface EncryptedEnvelope {
  payload_iv: string;
  payload_ct: string;
  payload_tag: string;
  dek_iv: string;
  dek_wrapped: string;
  dek_tag: string;
}

export function encryptEnvelope(data: any, masterKeyHex: string): EncryptedEnvelope {
  // validating master key
  if (masterKeyHex.length !== 64) throw new Error("Master Key must be 32 bytes (64 hex chars)");
  const masterKey = Buffer.from(masterKeyHex, 'hex');

  // generating key
  const dek = randomBytes(KEY_LENGTH);

  // encrypting data with key
  const payloadIv = randomBytes(IV_LENGTH);
  const payloadCipher = createCipheriv(ALGORITHM, dek, payloadIv);
  
  // encrypting the payload
  let payloadEncrypted = payloadCipher.update(JSON.stringify(data), 'utf8', 'hex');
  payloadEncrypted += payloadCipher.final('hex');
  const payloadTag = payloadCipher.getAuthTag().toString('hex');

  // encrypting key with master key
  const dekIv = randomBytes(IV_LENGTH);
  const dekCipher = createCipheriv(ALGORITHM, masterKey, dekIv);
  
  const dekEncryptedBuffer = Buffer.concat([
    dekCipher.update(dek), 
    dekCipher.final()     
  ]);
  const dekEncrypted = dekEncryptedBuffer.toString('hex');

  const dekTag = dekCipher.getAuthTag().toString('hex');

  return {
    payload_iv: payloadIv.toString('hex'),
    payload_ct: payloadEncrypted,
    payload_tag: payloadTag,
    dek_iv: dekIv.toString('hex'),
    dek_wrapped: dekEncrypted,
    dek_tag: dekTag
  };
}

export function decryptEnvelope(envelope: EncryptedEnvelope, masterKeyHex: string): any {
  const masterKey = Buffer.from(masterKeyHex, 'hex');

  // decrypting key
  const dekDecipher = createDecipheriv(ALGORITHM, masterKey, Buffer.from(envelope.dek_iv, 'hex'));
  dekDecipher.setAuthTag(Buffer.from(envelope.dek_tag, 'hex')); 

  let dek = dekDecipher.update(envelope.dek_wrapped, 'hex');
  dek = Buffer.concat([dek, dekDecipher.final()]);

  // decrypting data
  const payloadDecipher = createDecipheriv(ALGORITHM, dek, Buffer.from(envelope.payload_iv, 'hex'));
  payloadDecipher.setAuthTag(Buffer.from(envelope.payload_tag, 'hex')); 

  let decrypted = payloadDecipher.update(envelope.payload_ct, 'hex', 'utf8');
  decrypted += payloadDecipher.final('utf8');

  return JSON.parse(decrypted);
}