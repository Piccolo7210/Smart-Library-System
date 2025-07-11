#!/bin/bash

# Smart Library System - Container Startup Script
# This script starts all Docker containers defined in docker-compose.yaml

echo "🚀 Starting Smart Library System containers..."

# Check if docker-compose.yaml exists
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Error: docker-compose.yaml not found in current directory!"
    exit 1
fi

# Start the containers
docker-compose up -d

# Check if docker-compose command was successful
if [ $? -eq 0 ]; then
    echo "✅ All containers started successfully!"
    echo
    echo "📊 Container status:"
    docker-compose ps
else
    echo "❌ Failed to start containers!"
    exit 1
fi

echo
echo "📝 To view logs: docker-compose logs -f [service-name]"
echo "🌐 Access the API gateway at: http://localhost:8080"