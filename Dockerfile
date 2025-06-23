# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./
COPY prisma ./prisma

RUN npm ci
COPY . .
RUN npm run build

RUN cp -r prisma /tmp/prisma-backup

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy dependencies and Prisma files
COPY package*.json ./
COPY package-lock.json ./
COPY --from=builder /tmp/prisma-backup ./prisma

RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]