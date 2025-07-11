#!/bin/bash

# Smart Library System - Container Teardown Script
# This script stops and removes all containers, networks, and volumes

echo "⚠️ Shutting down Smart Library System containers..."
echo "This will remove all containers, networks, and anonymous volumes."

# Prompt for confirmation
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation canceled."
    exit 0
fi

# Check if docker-compose.yaml exists
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Error: docker-compose.yaml not found in current directory!"
    exit 1
fi

# Bring down the containers
docker-compose down

# Check if docker-compose command was successful
if [ $? -eq 0 ]; then
    echo "✅ All containers shut down and removed successfully!"
else
    echo "❌ Failed to bring down containers!"
    exit 1
fi

echo
echo "🧹 To remove all unused Docker resources, run: docker system prune"
echo "🚀 To start fresh: ./start-containers.sh"