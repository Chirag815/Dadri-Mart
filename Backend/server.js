import 'dotenv/config';
import http from 'http';
import app from './app/app.js';
import connectDB from './app/config/database.js';
import { seedDatabase } from './app/config/seed.js';

const server = http.createServer(app);

const port = process.env.PORT || 4000;

await connectDB();
await seedDatabase();

server.listen(port, () => {
    console.log(`Server is up and running on http://localhost:${port}`);
});
