#!/bin/bash

# Smart Library System - Docker Stop Script
# This script stops all running containers

echo "🛑 Stopping Smart Library System containers..."
echo "=============================================="

# Stop all smart-library containers
containers=$(docker ps -q --filter "name=smart-library")

if [ -z "$containers" ]; then
    echo "ℹ️  No Smart Library containers are currently running."
else
    echo "🔍 Found running containers, stopping them..."
    docker stop $containers
    docker rm $containers
    echo "✅ All Smart Library containers stopped and removed."
fi

echo ""
echo "🧹 Cleaning up unused images (optional)..."
read -p "Do you want to remove unused Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker image prune -f
    echo "✅ Unused images cleaned up."
else
    echo "ℹ️  Skipped image cleanup."
fi

echo ""
echo "🎯 All done!"
