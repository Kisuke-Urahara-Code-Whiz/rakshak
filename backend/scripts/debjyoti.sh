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
    chmod +x ./mvnw
    ./mvnw clean package -DskipTests

    echo "✓ $name built successfully"
}

build_service "SMS-SERVICE" "../java/sms-service"

echo
echo "========================================"
echo " Starting Docker Compose"
echo "========================================"

cd "$BASE_DIR/.."
docker compose up -d

echo
echo "✓ All services started"
