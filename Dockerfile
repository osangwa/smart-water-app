# Stage 1: Build the React frontend using Node
FROM node:18 AS frontend-builder
WORKDIR /app

# Copy only necessary files for frontend build
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the frontend files and build
COPY . .
RUN npm run build

# Stage 2: Serve frontend + PocketBase using Alpine
FROM alpine:latest
WORKDIR /app

# Install dependencies like curl if needed
RUN apk add --no-cache bash curl

# --- PocketBase ---
# Copy the PocketBase binary (must already be in your repo)
COPY pb /app/pb
RUN chmod +x /app/pb

# Copy PocketBase folders
COPY pb_data /app/pb_data
COPY pb_public /app/pb_public

# Copy built frontend files into pb_public (so PocketBase can serve them)
COPY --from=frontend-builder /app/dist /app/pb_public

# Expose PocketBase port
EXPOSE 8090

# Start PocketBase server
CMD ["./pb", "serve", "--http=0.0.0.0:8090", "--dir", "/app/pb_data", "--publicDir", "/app/pb_public"]
