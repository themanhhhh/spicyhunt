import express from 'express';

const app = express();
const PORT = process.env.PORT || 10000;

console.log('Starting simple server...');
console.log('PORT:', PORT);

app.get('/', (req, res) => {
    res.send('SpicyHunt API is running...');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`==> Server is live on port ${PORT}`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
