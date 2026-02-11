import { encryptEnvelope, decryptEnvelope } from './index';

const MASTER_KEY = "0000000000000000000000000000000000000000000000000000000000000001";
const WRONG_KEY = "0000000000000000000000000000000000000000000000000000000000000002";

const SECRET_DATA = { 
  amount: 500, 
  currency: "USD",
  note: "Secret transfer to party_123" 
};

console.log("Starting Crypto Test Suite (5 Tests)...\n");

async function runTests() {
  let passed = 0;
  let total = 0;
  const expectError = (name: string, fn: () => void) => {
    total++;
    try {
      fn();
      console.error(`[FAIL] ${name}: Should have thrown an error but didn't`);
    } catch (e: any) {
      console.log(`[PASS] ${name}: Caught expected error: ${e.message}`);
      passed++;
    }
  };
  const expectSuccess = (name: string, fn: () => void) => {
    total++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`[FAIL] ${name}: Error: ${e.message}`);
    }
  };

  // 1. Happy Path
  let validEnvelope: any;
  expectSuccess("Test 1: Encrypt -> Decrypt Flow", () => {
    validEnvelope = encryptEnvelope(SECRET_DATA, MASTER_KEY);
    const result = decryptEnvelope(validEnvelope, MASTER_KEY);
    
    if (JSON.stringify(result) !== JSON.stringify(SECRET_DATA)) {
      throw new Error("Decrypted data mismatch");
    }
  });

  // 2. Tampered Ciphertext (The "Man-in-the-Middle" Attack)
  expectError("Test 2: Tampered Ciphertext", () => {
    const tamperedEnvelope = { ...validEnvelope };
    // Flip the last char of the ciphertext
    const len = tamperedEnvelope.payload_ct.length;
    const lastChar = tamperedEnvelope.payload_ct[len - 1];
    const newChar = lastChar === 'a' ? 'b' : 'a'; 
    tamperedEnvelope.payload_ct = tamperedEnvelope.payload_ct.slice(0, -1) + newChar;
    
    decryptEnvelope(tamperedEnvelope, MASTER_KEY);
  });

  // 3. Tampered Tag (The "Signature Forgery" Attack)
  expectError("Test 3: Tampered Auth Tag", () => {
    const tamperedEnvelope = { ...validEnvelope };
    // Tamper with the tag
    tamperedEnvelope.payload_tag = "00000000000000000000000000000000"; 
    decryptEnvelope(tamperedEnvelope, MASTER_KEY);
  });

  // 4. Wrong Nonce Length (The "Bad Format" Attack)
  expectError("Test 4: Invalid Nonce Length", () => {
    const badEnvelope = { ...validEnvelope };
    // Make nonce too short (standard is 12 bytes = 24 hex chars)
    badEnvelope.payload_nonce = "123456"; 
    decryptEnvelope(badEnvelope, MASTER_KEY);
  });

  // 5. Wrong Master Key (The "Unauthorized Access" Attack)
  expectError("Test 5: Decrypting with Wrong Key", () => {
    decryptEnvelope(validEnvelope, WRONG_KEY);
  });

  console.log(`\nTest Summary: ${passed}/${total} Tests Passed.`);
  if (passed === total) process.exit(0);
  else process.exit(1);
}

runTests();