docker-compose up -d

sleep 5

docker exec -it mongo1 bash -c "/scripts/rs-init.sh"

docker stop zookeeper kafkaMQ kafka-ui debezium 
docker stop userservices gateway departmentservices assignmentservices activityservices projectservices taskservices emailservices uploadservices

docker start zookeeper

sleep 10

docker start kafkaMQ debezium kafka-ui

sleep 20

docker start userservices departmentservices assignmentservices activityservices projectservices taskservices emailservices gateway uploadservices