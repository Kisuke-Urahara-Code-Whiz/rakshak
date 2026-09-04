build_service() (
    local name="$1"
    local dir="$2"

    echo "------ BUILDING $name ------"
    cd "$dir"
    ./mvnw clean package -DskipTests
    echo "✓ $name built"
)

discovery() { build_service "DISCOVERY-SERVICE" "../java/discovery-service"; }
gateway()   { build_service "GATEWAY-SERVICE"   "../java/gateway-service"; }
media()     { build_service "MEDIA-SERVICE"     "../java/media-service"; }
sms_test()  { build_service "SMS-TEST-SERVICE"  "../java/sms-test-service"; }

discovery
gateway
media
sms_test

docker compose up -d
