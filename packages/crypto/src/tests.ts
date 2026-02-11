import { encryptEnvelope, decryptEnvelope } from './index';


const MASTER_KEY = "0000000000000000000000000000000000000000000000000000000000000001";

const SECRET_DATA = { 
  amount: 500, 
  currency: "USD",
  note: "Secret transfer to party_123" 
};

console.log("Starting Crypto Test...");

try {
  console.log("Encrypting...");
  const envelope = encryptEnvelope(SECRET_DATA, MASTER_KEY);
  
  console.log("Envelope Created:");
  console.log(JSON.stringify(envelope, null, 2));

  console.log("\nDecrypting...");
  const result = decryptEnvelope(envelope, MASTER_KEY);
  
  console.log("Decrypted Result:", result);

  if (JSON.stringify(result) === JSON.stringify(SECRET_DATA)) {
    console.log("\nSUCCESS: The decrypted data matches the original!");
  } else {
    console.error("\nFAIL: The data does not match.");
    console.error("Expected:", SECRET_DATA);
    console.error("Received:", result);
    process.exit(1);
  }

} catch (e) {
  console.error("\nERROR: Something went wrong during the test.");
  console.error(e);
  process.exit(1);
}