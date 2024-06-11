"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const { assignmentTopicsOnDemand } = require("../configs/kafkaAssignmentTopic");
const kafka = new Kafka({
  clientId: "task-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({
  groupId: "task-assignment-on-demand-group",
});
const runConsumerAssignmentOnDemand = async () => {
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
          consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          consumer.disconnect();
        },
      })
      .catch(reject);
  });
};

module.exports = { runConsumerAssignmentOnDemand };
