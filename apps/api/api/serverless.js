import Fastify from 'fastify';
import cors from '@fastify/cors';
import { encryptEnvelope, decryptEnvelope } from '@repo/crypto';

const app = Fastify({ logger: true });

app.register(cors, { origin: '*' });

const MASTER_KEY = process.env.MASTER_KEY || "0000000000000000000000000000000000000000000000000000000000000001";
const db = new Map(); // Note: In serverless, this DB resets on every request!

app.get('/', async (req, reply) => {
    return { status: "OK", message: "Mirfa Secure Vault API is running" };
});

app.post('/tx/encrypt', async (req, reply) => {
    const body = req.body;
    if (!body || !body.payload) return reply.code(400).send({ error: "Missing payload" });
    
    try {
        const envelope = encryptEnvelope(body.payload, MASTER_KEY);
        // In a real app, save to a DB here. 
        // For this demo, we just return the envelope so the frontend can display it.
        return { 
            id: `tx_${Date.now()}`,
            ...envelope 
        };
    } catch (err) {
        return reply.code(500).send({ error: "Encryption failed" });
    }
});

export default async function handler(req, res) {
    await app.ready();
    app.server.emit('request', req, res);
}