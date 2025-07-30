#!/bin/bash

# Smart Library System - Container Startup Script
# This script starts all Docker containers defined in docker-compose.yaml

echo "🚀 Starting Smart Library System containers..."

# Check if docker-compose.yaml exists
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Error: docker-compose.yaml not found in current directory!"
    exit 1
fi
sudo systemctl stop nginx
# Determine which docker compose command to use
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Error: Neither docker-compose nor docker compose commands are available!"
    echo "Please install Docker and Docker Compose first:"
    echo "https://docs.docker.com/get-docker/"
    echo "https://docs.docker.com/compose/install/"
    exit 1
fi

echo "🔧 Using command: $COMPOSE_CMD"

# Start the containers
$COMPOSE_CMD up -d

# Check if command was successful
if [ $? -eq 0 ]; then
    echo "✅ All containers started successfully!"
    echo
    echo "📊 Container status:"
    $COMPOSE_CMD ps
else
    echo "❌ Failed to start containers!"
    exit 1
fi

echo
echo "📝 To view logs: $COMPOSE_CMD logs -f [service-name]"