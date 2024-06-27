docker-compose up -d

sleep 5

docker exec -it mongo1 bash -c "/scripts/rs-init.sh"
