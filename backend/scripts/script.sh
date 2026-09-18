#!/usr/bin/env bash

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

build_service() {
    local name="$1"
    local dir="$2"

    echo
    echo "========================================"
    echo " Building $name"
    echo "========================================"

    cd "$BASE_DIR/$dir"
    mvn clean package -DskipTests

    echo "✓ $name built successfully"
}

build_service "DISCOVERY-SERVICE" "../java/discovery-service"
build_service "GATEWAY-SERVICE" "../java/gateway-service"
build_service "MEDIA-SERVICE" "../java/media-service"
build_service "SQL-SERVICE" "../java/sql-service"
build_service "SMS-SERVICE" "../java/sms-service"
build_service "ROOM-SERVICE" "../java/room-service"

echo
echo "========================================"
echo " Starting Docker Compose"
echo "========================================"

cd "$BASE_DIR"
cd ../
docker compose up -d
