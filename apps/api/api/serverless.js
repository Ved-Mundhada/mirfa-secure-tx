import Fastify from 'fastify';
import cors from '@fastify/cors';
import { encryptEnvelope, decryptEnvelope } from '@repo/crypto';

const MASTER_KEY = process.env.MASTER_KEY || "0000000000000000000000000000000000000000000000000000000000000001";
const db = new Map(); // Note: In serverless, this DB resets on cold starts!

let app;

async function buildApp() {
    if (app) return app;
    
    app = Fastify({ logger: true });
    
    await app.register(cors, { origin: '*' });

    app.get('/', async (req, reply) => {
        return { status: "OK", message: "Mirfa Secure Vault API is running" };
    });

    app.post('/tx/encrypt', async (req, reply) => {
        const body = req.body;
        if (!body || !body.payload) return reply.code(400).send({ error: "Missing payload" });
        
        try {
            const envelope = encryptEnvelope(body.payload, MASTER_KEY);
            const id = `tx_${Date.now()}`;
            db.set(id, { partyId: body.partyId || 'anon', ...envelope });
            return { id, ...envelope };
        } catch (err) {
            return reply.code(500).send({ error: "Encryption failed" });
        }
    });

    app.get('/tx/:id', async (req, reply) => {
        const { id } = req.params;
        const data = db.get(id);
        if (!data) return reply.code(404).send({ error: "Transaction not found" });
        return data;
    });

    app.post('/tx/:id/decrypt', async (req, reply) => {
        const { id } = req.params;
        const data = db.get(id);
        if (!data) return reply.code(404).send({ error: "Transaction not found" });
        
        try {
            const decryptedPayload = decryptEnvelope(data, MASTER_KEY);
            return decryptedPayload;
        } catch (err) {
            return reply.code(400).send({ error: "Decryption failed. Data might be tampered." });
        }
    });

    await app.ready();
    return app;
}

// Vercel serverless handler  
export default async function handler(req, res) {
    try {
        const fastify = await buildApp();
        
        // Get the original URL path (remove /api/serverless prefix if present)
        let url = req.url || '/';
        if (url.startsWith('/api/serverless')) {
            url = url.replace('/api/serverless', '') || '/';
        }
        
        console.log('Original req.url:', req.url);
        console.log('Processed url:', url);
        
        const response = await fastify.inject({
            method: req.method,
            url: url,
            headers: req.headers,
            payload: req.body
        });
        
        res.status(response.statusCode);
        for (const [key, value] of Object.entries(response.headers)) {
            if (value) res.setHeader(key, value);
        }
        res.send(response.payload);
    } catch (err) {
        console.error('Handler error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
}