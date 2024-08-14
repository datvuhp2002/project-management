const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const { runProducer } = require("../message_queue/producer");
const { deleteFile } = require("../services/upload.services");
const { taskTopicsContinuous } = require("../configs/kafkaTaskTopic");
const { projectTopicsContinuous } = require("../configs/kafkaProjectTopic");

const kafka = new Kafka({
  clientId: "upload-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "upload-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(taskTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(projectTopicsContinuous),
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        switch (topic) {
          case taskTopicsContinuous.deleteTaskFileInCloud:
            await deleteFile(parsedMessage.filePath);
            break;
          case projectTopicsContinuous.archiveProjectFiles:
            break;

          default:
            console.log("Unhandled topic:", topic);
        }

        await heartbeat(); // Ensures Kafka knows that the consumer is still alive
      } catch (error) {
        console.error(`Error processing message from topic ${topic}:`, error);
      }
    },
  });
};

module.exports = { continuousConsumer };
