const { Kafka } = require("kafkajs");
const {
  assignmentTopicsContinuous,
} = require("../configs/kafkaAssignmentTopic");
const {
  uploadTopicsOnDemand,
  uploadTopicsContinuous,
  uploadProducerTopic,
} = require("../configs/kafkaUploadTopic");
const { convertObjectToArray } = require("../utils");
const ProjectService = require("../services/project.service");
const ClientService = require("../services/client.service");
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
    topics: convertObjectToArray(assignmentTopicsContinuous),
    fromBeginning: true,
  });

  await consumer.subscribe({
    topics: convertObjectToArray(uploadTopicsContinuous),
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        switch (topic) {
          case assignmentTopicsContinuous.abc:
            if (parsedMessage !== null) {
              console.log("After:::", parsedMessage);
            }
            break;
          case uploadTopicsContinuous.uploadFileForProject:
            await ProjectService.uploadFile(
              parsedMessage.project_id,
              parsedMessage.file
            );
            break;
          case uploadTopicsContinuous.uploadAvartarClient:
            console.log(parsedMessage);
            await ClientService.update(
              parsedMessage.client_id,
              { avatar: parsedMessage.file },
              parsedMessage.modifiedBy
            );
            break;
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
