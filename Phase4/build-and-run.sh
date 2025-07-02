#!/bin/bash

# Smart Library System - Docker Build and Run Script
# This script builds and runs all microservices

set -e  # Exit on any error

echo "🚀 Smart Library System - Docker Build & Run"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to build Docker image
build_service() {
    local service_name=$1
    local service_dir=$2
    
    echo -e "${BLUE}📦 Building $service_name...${NC}"
    cd $service_dir
    docker build -t smart-library-$service_name:latest .
    cd ..
    echo -e "${GREEN}✅ $service_name built successfully${NC}"
    echo ""
}

# Function to run Docker container
run_service() {
    local service_name=$1
    local port=$2
    local container_name="smart-library-$service_name"
    
    echo -e "${BLUE}🏃 Running $service_name on port $port...${NC}"
    
    # Stop existing container if running
    if docker ps -q -f name=$container_name | grep -q .; then
        echo -e "${YELLOW}⚠️  Stopping existing $container_name container...${NC}"
        docker stop $container_name
        docker rm $container_name
    fi
    
    # Run new container
    docker run -d --name $container_name -p $port:$port smart-library-$service_name:latest
    echo -e "${GREEN}✅ $service_name running on http://smart-library.com:$port${NC}"
    echo ""
}

echo -e "${YELLOW}🏗️  Building all services...${NC}"
echo ""

# Build all services
build_service "user-service" "user-service"
build_service "book-service" "book-service" 
build_service "loan-service" "loan-service"
build_service "nginx12" "nginx"

echo -e "${YELLOW}🚀 Starting all services...${NC}"
echo ""

# Run all services
run_service "user-service" "3001"
run_service "book-service" "3002"
run_service "loan-service" "3003"
run_service "nginx12" "8080"

echo -e "${GREEN}🎉 All services are running!${NC}"
echo ""
echo "📋 Service URLs:"
echo "• User Service:  http://smart-library.com:3001"
echo "• Book Service:  http://smart-library.com:3002" 
echo "• Loan Service:  http://smart-library.com:3003"
echo "• NGINX Gateway: http://localhost:80"
echo ""
echo "🔍 To check status: docker ps"
echo "📋 To view logs: docker logs smart-library-[service-name]"
echo "🛑 To stop all: docker stop \$(docker ps -q --filter \"name=smart-library\")"
