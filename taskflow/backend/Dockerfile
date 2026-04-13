# ============================================
# STAGE 1: Build
# ============================================
# This stage installs ALL dependencies (including dev)
# and prepares the application

FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application code
COPY . .

# ============================================
# STAGE 2: Production
# ============================================
# This stage creates the final, minimal image

FROM node:20-alpine AS production

# Install dbmate for running migrations
RUN apk add --no-cache curl postgresql-client \
    && curl -fsSL -o /usr/local/bin/dbmate https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64 \
    && chmod +x /usr/local/bin/dbmate
    
# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy application code from builder stage
COPY --from=builder /app/src ./src

# Copy database files (migrations + seed)
COPY --from=builder /app/db ./db

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Expose the port
EXPOSE 3000

# Use entrypoint script to run migrations then start server
ENTRYPOINT ["./entrypoint.sh"]