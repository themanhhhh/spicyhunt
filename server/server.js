import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import addressRoutes from './routes/address.routes.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import foodRoutes from './routes/food.routes.js';
import userRoutes from './routes/user.routes.js';
import orderRoutes from './routes/order.routes.js';
import statisticRoutes from './routes/statistic.routes.js';
import actionLogRoutes from './routes/actionLog.routes.js';
import discountRoutes from './routes/discount.routes.js';
import tableRoutes from './routes/table.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://spicyhunt.vercel.app',
    'https://spicyhunt-yofh-jqb7m8emx-themanhhhhs-projects.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true
}));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/customer/address', addressRoutes); // Alias for frontend compatibility
app.use('/api/category', categoryRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/account', userRoutes);
app.use('/api/customer/order', orderRoutes);
app.use('/api/order', orderRoutes); // Alias for frontend compatibility
app.use('/api/statistic', statisticRoutes);
app.use('/api/action-log', actionLogRoutes);
app.use('/api/discount', discountRoutes);
app.use('/api/table', tableRoutes);
app.use('/api/order-table', tableRoutes); // Alias for frontend compatibility

// Basic route
app.get('/', (req, res) => {
  res.send('SpicyHunt API is running...');
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server first, then connect to MongoDB
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Connect to MongoDB after server starts
  connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
  });
});
