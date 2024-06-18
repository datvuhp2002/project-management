const { Kafka } = require("kafkajs");
const {
  assignmentTopicsContinuous,
} = require("../configs/kafkaAssignmentTopic");
const {
  uploadTopicsOnDemand,
  uploadProducerTopic,
} = require("../configs/kafkaUploadTopic");
const { convertObjectToArray } = require("../utils");
const ProjectService = require("../services/project.service"); // Đảm bảo rằng bạn đã import UserService
const ClientService = require("../services/client.service"); // Đảm bảo rằng bạn đã import UserService
const { runProducer } = require("../message_queue/uploadProducer"); // Đảm bảo rằng bạn đã import runProducer

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
    topics: convertObjectToArray(uploadTopicsOnDemand),
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log("Before handle :::", parsedMessage);

        switch (topic) {
          case assignmentTopicsContinuous.abc:
            if (parsedMessage !== null) {
              console.log("After:::", parsedMessage);
            }
            break;

          case uploadTopicsOnDemand.uploadFile:
            const { project_id, path, filename } = parsedMessage;
            const uploadSuccess = await ProjectService.uploadFile(project_id, {
              path,
              filename,
            });
            try {
              await runProducer(uploadProducerTopic.uploadFile, {
                project_id,
                success: uploadSuccess,
              });
              console.log("Upload result sent:", {
                project_id,
                success: uploadSuccess,
              });
            } catch (error) {
              console.error("Failed to send upload result:", error);
            }
            break;
          case uploadTopicsOnDemand.uploadImageFromLocal:
            const { client_id, avatar } = parsedMessage;
            const uploadImageSuccess = await ClientService.uploadImageFromLocal(
              client_id,
              avatar
            );
            try {
              await runProducer(uploadProducerTopic.uploadImageFromLocal, {
                client_id,
                success: uploadImageSuccess,
              });
              console.log("Upload image result sent:", {
                client_id,
                success: uploadImageSuccess,
              });
            } catch (error) {
              console.error("Failed to send upload image result:", error);
            }
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
