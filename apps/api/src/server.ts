import Fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import cors from '@fastify/cors';
import { encryptEnvelope, decryptEnvelope } from '@repo/crypto';

// 1. setting up a simple Fastify server with CORS enabled
const server = Fastify({ logger: true });

server.register(cors, { origin: '*' });

const db = new Map<string, any>();

// 3. master key for encryption/decryption
const MASTER_KEY = "0000000000000000000000000000000000000000000000000000000000000001";

// Root route for health check
server.get('/', async (request, reply) => {
  return { status: "ok", message: "Mirfa Secure Tx API is running" };
});


server.post('/tx/encrypt', async (request, reply) => {
  const body = request.body as any;

  if (!body || !body.payload) {
    return reply.code(400).send({ error: "Missing payload" });
  }

  try {
    const encryptedData = encryptEnvelope(body.payload, MASTER_KEY);

    const id = `tx_${Date.now()}`;

    db.set(id, {
      partyId: body.partyId || 'anon',
      ...encryptedData
    });

    return { id };

  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: "Encryption failed" });
  }
});

server.get('/tx/:id', async (request, reply) => {
  const { id } = request.params as any;
  const data = db.get(id);

  if (!data) return reply.code(404).send({ error: "Transaction not found" });

  return data;
});

server.post('/tx/:id/decrypt', async (request, reply) => {
  const { id } = request.params as any;
  const data = db.get(id);

  if (!data) return reply.code(404).send({ error: "Transaction not found" });

  try {
    const decryptedPayload = decryptEnvelope(data, MASTER_KEY);
    return decryptedPayload;
  } catch (err) {
    request.log.error(err);
    return reply.code(400).send({ error: "Decryption failed. Data might be tampered." });
  }
});

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// ... other imports ...

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}

export default server;