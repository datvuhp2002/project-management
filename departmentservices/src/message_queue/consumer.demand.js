"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { userTopicsOnDemand } = require("../configs/kafkaUserTopic");
const kafka = new Kafka({
  clientId: "department-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({ groupId: "department-on-demand-group" });

const runConsumerOnDemand = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsOnDemand),
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
