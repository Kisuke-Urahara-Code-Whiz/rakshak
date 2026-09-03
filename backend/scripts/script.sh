media()(
	cd ../java/media-service
	mvn clean package -DskipTests
)

media
docker compose up -d
