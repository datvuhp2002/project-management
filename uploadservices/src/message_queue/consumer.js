const { Kafka } = require("kafkajs");
const {
  taskTopicsOnDemand,
  taskTopicsContinuous,
  taskProducerTopic,
} = require("../configs/kafkaTaskTopic");
const {
  userTopicsOnDemand,
  userTopicsContinuous,
  userProducerTopic,
} = require("../configs/kafkaUserTopic");
const {
  projectTopicsOnDemand,
  projectTopicsContinuous,
  projectProducerTopic,
} = require("../configs/kafkaProjectTopic");
const { convertObjectToArray } = require("../utils");
const { runProducer } = require("../message_queue/producer");

const kafka = new Kafka({
  clientId: "upload-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "upload-continuous-group" });
  await consumer.connect();

  // Subscribe to continuous topics
  await consumer.subscribe({
    topics: convertObjectToArray(taskTopicsContinuous),
    fromBeginning: true,
  });

  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsContinuous),
    fromBeginning: true,
  });

  await consumer.subscribe({
    topics: convertObjectToArray(projectTopicsContinuous),
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log("Before handle :::", parsedMessage);
        switch (topic) {
          case userTopicsContinuous.uploadAvatarFromLocal:
            console.log(
              `Produced message to update avatar for user ID ${parsedMessage.user_id}`
            );
            break;
          case taskTopicsContinuous.uploadFileForTask:
            await runProducer(taskTopicsContinuous.uploadFileForTask, {
              task_id: parsedMessage.task_id,
              file: parsedMessage.file,
            });
            console.log(
              `Produced message to update file for task ID ${parsedMessage.task_id}`
            );
            break;
          case projectTopicsContinuous.uploadFileForProject:
            await runProducer(projectTopicsContinuous.uploadFileForProject, {
              id: parsedMessage.project_id,
              file: parsedMessage.file,
            });
            console.log(
              `Produced message to update file for project ID ${parsedMessage.project_id}`
            );
            break;
          case projectTopicsContinuous.uploadAvatarClient:
            await runProducer(projectTopicsContinuous.uploadAvatarClient, {
              id: parsedMessage.client_id,
              file: parsedMessage.file,
            });
            console.log(
              `Produced message to update avatar for client ID ${parsedMessage.client_id}`
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
