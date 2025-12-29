# SpicyHunt Backend API

Node.js Express backend for SpicyHunt food ordering application.

## Deployment to Render

### Prerequisites
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get the connection string

### Environment Variables (set in Render Dashboard)
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `VNPAY_TMN_CODE` - VNPay merchant code
- `VNPAY_HASH_SECRET` - VNPay hash secret
- `VNPAY_PAYMENT_URL` - VNPay payment URL
- `VNPAY_RETURN_URL` - Return URL after payment
- `VNPAY_API_URL` - VNPay API URL

### Local Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install
npm start
```
