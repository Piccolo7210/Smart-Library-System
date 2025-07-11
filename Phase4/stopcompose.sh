#!/bin/bash

# Smart Library System - Container Stop Script
# This script stops all running containers without removing them

echo "🛑 Stopping Smart Library System containers..."

# Check if docker-compose.yaml exists
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Error: docker-compose.yaml not found in current directory!"
    exit 1
fi

# Stop the containers
docker-compose stop

# Check if docker-compose command was successful
if [ $? -eq 0 ]; then
    echo "✅ All containers stopped successfully!"
    echo
    echo "📊 Container status:"
    docker-compose ps
else
    echo "❌ Failed to stop containers!"
    exit 1
fi

echo
echo "▶️ To restart containers: ./start-containers.sh"