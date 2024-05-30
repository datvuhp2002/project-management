"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const {
  userTopicsOnDemand,
  userTopicsContinuous,
} = require("../configs/kafkaUserTopic");
const DepartmentService = require("../services/department.service");
const kafka = new Kafka({
  clientId: "department-services",
  brokers: ["localhost:9092"],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "department-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", parsedMessage);
      switch (topic) {
        case userTopicsContinuous.deleteUser:
          if (parsedMessage !== null) {
            console.log("After:::", parsedMessage);
            return await DepartmentService.deleteManagerId(parsedMessage);
          }
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
      await consumer.commitOffsets([
        { topic, partition, offset: (Number(message.offset) + 1).toString() },
      ]);
      await heartbeat();
    },
  });
};
const runConsumerOnDemand = async () => {
  const consumer = kafka.consumer({ groupId: "department-on-demand-group" });
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

module.exports = { runConsumerOnDemand, continuousConsumer };
