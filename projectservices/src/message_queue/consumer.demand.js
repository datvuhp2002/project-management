const { Kafka } = require("kafkajs");
const { assignmentTopicsOnDemand } = require("../configs/kafkaAssignmentTopic");
const { convertObjectToArray } = require("../utils");
const kafka = new Kafka({
  clientId: "project-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({ groupId: "project-on-demand-group" });

const runConsumerOnDemand = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsOnDemand),
    fromBeginning: false,
  });
  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({ topic, partition, message }) => {
          const parsedMessage = JSON.parse(message.value.toString());
          console.log(parsedMessage);
          resolve(parsedMessage);
          consumer.disconnect();
        },
      })
      .catch(reject);
  });
};

module.exports = { runConsumerOnDemand };
