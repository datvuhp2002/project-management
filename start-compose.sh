docker-compose up -d

sleep 5

docker exec -it mongo1 bash -c "/scripts/rs-init.sh"

docker stop kibana zookeeper kafkaMQ kafka-ui elasticsearch debezium 
docker stop userservices gateway departmentservices assignmentservices activityservices projectservices taskservices emailservices

docker start zookeeper elasticsearch

sleep 5

docker start kibana kafkaMQ debezium kafka-ui

sleep 20

docker start userservices departmentservices assignmentservices activityservices projectservices taskservices emailservices gateway