const { Kafka } = require("kafkajs");
const { uploadTopicsContinuous } = require("../configs/kafkaUploadTopic");
const { convertObjectToArray } = require("../utils");
const ProjectService = require("../services/project.service");

const kafka = new Kafka({
  clientId: "project-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "project-continuous-group" });
  await consumer.connect();

  // Subscribe to continuous topics
  await consumer.subscribe({
    topics: convertObjectToArray(uploadTopicsContinuous),
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log(
          `Received message from topic: ${topic}, partition: ${partition}`
        );
        console.log("Message content:", parsedMessage);
        switch (topic) {
          case uploadTopicsContinuous.uploadFileForProject: {
            if (parsedMessage.project_id && parsedMessage.file) {
              await ProjectService.uploadFile(
                parsedMessage.project_id,
                parsedMessage.file
              );
              console.log(
                `File uploaded for project ${parsedMessage.project_id}`
              );
            } else {
              console.warn(
                "Invalid data for uploadFileForProject:",
                parsedMessage
              );
            }
            break;
          }
          case uploadTopicsContinuous.deleteProjectFileInCloud: {
            if (parsedMessage.filePath) {
              await ProjectService.deleteFile(parsedMessage.filePath);
              console.log(`File deleted: ${parsedMessage.filePath}`);
            } else {
              console.warn(
                "Invalid data for deleteProjectFileInCloud:",
                parsedMessage
              );
            }
            break;
          }
          default:
            console.log("Unhandled topic:", topic);
        }

        await heartbeat();
      } catch (err) {
        console.error("Error handling message:", err);
      }
    },
  });
};

module.exports = { continuousConsumer };
