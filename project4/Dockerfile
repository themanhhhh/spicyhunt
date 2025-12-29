# Stage 1: build
FROM node:18-alpine AS builder

WORKDIR /app

# Chỉ copy file khai báo dependency
COPY package*.json ./

# Cài production-only dependencies (bỏ devDeps)
RUN npm ci --omit=dev

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build Next.js (tạo thư mục .next)
RUN npm run build

# Stage 2: run – chỉ mang những gì cần
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Chỉ copy phần cần thiết để chạy
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Ensure next.config.mjs is copied
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "start"]
