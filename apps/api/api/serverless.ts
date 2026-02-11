
import type { VercelRequest, VercelResponse } from '@vercel/node';
import server from '../src/server.js';

export default async function (req: VercelRequest, res: VercelResponse) {
    await server.ready();
    server.server.emit('request', req, res);
}
