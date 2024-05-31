const { Kafka } = require("kafkajs");
const { assignmentTopicsOnDemand } = require("../configs/kafkaAssignmentTopic");
const { userTopicsOnDemand } = require("../configs/kafkaUserTopic");
const { convertObjectToArray } = require("../utils");

const kafka = new Kafka({
  clientId: "assignment-services",
  brokers: ["localhost:9092"],
});

const runConsumerOnDemand = async () => {
  const consumer = kafka.consumer({ groupId: "assignment-on-demand-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsOnDemand),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsOnDemand),
    fromBeginning: false,
  });
  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({ topic, partition, message }) => {
          const parsedMessage = JSON.parse(message.value.toString());
          consumer.disconnect();
          resolve(parsedMessage);
        },
      })
      .catch(reject);
  });
};

module.exports = { runConsumerOnDemand };
