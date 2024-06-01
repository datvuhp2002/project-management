"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const {
  assignmentTopicsContinuous,
  assignmentProducerTopic,
} = require("../configs/kafkaAssignmentTopic");
const kafka = new Kafka({
  clientId: "task-services",
  brokers: [process.env.KAFKA_BROKER],
});
const runConsumerOnDemand = async () => {
  const consumer = kafka.consumer({ groupId: "task-on-demand-group" });
  await consumer.connect();
  // await consumer.subscribe({
  //   topics: convertObjectToArray(userTopicsOnDemand),
  //   fromBeginning: false,
  // });
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
