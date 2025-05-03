# ----------- Build React Frontend -------------
    FROM node:18-alpine AS frontend

    WORKDIR /app
    
    # Copy frontend code
    COPY frontend ./frontend
    WORKDIR /app/frontend
    
    # Install dependencies and build
    RUN npm install && npm run build
    
    # ----------- Final Image with PocketBase + Frontend -------------
    FROM alpine:latest
    
    RUN apk add --no-cache ca-certificates
    
    WORKDIR /app
    
    # Copy PocketBase binary
    COPY pocketbase .
    
    # Copy PocketBase data folder (optional)
    COPY pb_data ./pb_data
    
    # Copy built frontend from previous stage
    COPY --from=frontend /app/frontend/dist ./pb_public
    
    # Expose PocketBase port
    EXPOSE 8090
    
    # Run PocketBase with custom public folder
    CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--publicDir", "./pb_public"]
    