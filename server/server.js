import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

console.log('Starting server...');

// Load environment variables
dotenv.config();

const app = express();
// Render uses port 10000 by default
const PORT = process.env.PORT || 10000;

console.log('Environment loaded, PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Handle uncaught exceptions to prevent crash
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://spicyhunt.vercel.app',
      'https://spicyhunt-yofh-jqb7m8emx-themanhhhhs-projects.vercel.app'
    ];

    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now
  },
  credentials: true
}));
app.use(express.json());

// Basic routes (before loading other routes)
app.get('/', (req, res) => {
  res.send('SpicyHunt API is running...');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`==> Server is live on port ${PORT}`);
  console.log(`==> Listening on 0.0.0.0:${PORT}`);
});

// Render recommended: increase timeouts to prevent connection issues
server.keepAliveTimeout = 120000; // 120 seconds
server.headersTimeout = 120000; // 120 seconds

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err.message);
});

// Then load routes and connect to DB asynchronously
async function initializeApp() {
  try {
    console.log('Loading routes...');

    const addressRoutes = (await import('./routes/address.routes.js')).default;
    const authRoutes = (await import('./routes/auth.routes.js')).default;
    const categoryRoutes = (await import('./routes/category.routes.js')).default;
    const foodRoutes = (await import('./routes/food.routes.js')).default;
    const userRoutes = (await import('./routes/user.routes.js')).default;
    const orderRoutes = (await import('./routes/order.routes.js')).default;
    const statisticRoutes = (await import('./routes/statistic.routes.js')).default;
    const actionLogRoutes = (await import('./routes/actionLog.routes.js')).default;
    const discountRoutes = (await import('./routes/discount.routes.js')).default;
    const tableRoutes = (await import('./routes/table.routes.js')).default;

    console.log('Routes loaded, registering...');

    app.use('/api/auth', authRoutes);
    app.use('/api/address', addressRoutes);
    app.use('/api/customer/address', addressRoutes);
    app.use('/api/category', categoryRoutes);
    app.use('/api/food', foodRoutes);
    app.use('/api/account', userRoutes);
    app.use('/api/customer/order', orderRoutes);
    app.use('/api/order', orderRoutes);
    app.use('/api/statistic', statisticRoutes);
    app.use('/api/action-log', actionLogRoutes);
    app.use('/api/discount', discountRoutes);
    app.use('/api/table', tableRoutes);
    app.use('/api/order-table', tableRoutes);

    console.log('Routes registered');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    if (process.env.MONGO_URI) {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });
        console.log('MongoDB Connected:', mongoose.connection.host);
      } catch (dbError) {
        console.error('MongoDB connection failed:', dbError.message);
        console.log('Server continues running without database connection');
      }
    } else {
      console.log('MONGO_URI not set, skipping database connection');
    }

  } catch (error) {
    console.error('Initialization error:', error.message);
    console.error(error.stack);
  }
}

initializeApp();
