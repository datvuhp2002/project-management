const { Kafka } = require("kafkajs");
const { uploadTopicsContinuous } = require("../configs/kafkaUploadTopic");
const { convertObjectToArray } = require("../utils");
const ProjectService = require("../services/project.service");
const { runProducer } = require("../message_queue/producer");

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
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        switch (topic) {
          case uploadTopicsContinuous.uploadFileForProject:
            await ProjectService.uploadFile(
              parsedMessage.project_id,
              parsedMessage.file
            );
            break;
          case uploadTopicsContinuous.deleteProjectFileInCloud: {
            await ProjectService.deleteFile(parsedMessage);
            break;
          }
          default:
            console.log("Unhandled topic:", topic);
        }
      } catch (err) {
        console.error("Error handling message:", err);
      }
    },
  });
};

module.exports = { continuousConsumer };
