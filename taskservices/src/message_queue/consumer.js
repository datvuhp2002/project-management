"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const {
  assignmentTopicsContinuous,
  assignmentProducerTopic,
} = require("../configs/kafkaAssignmentTopic");
const TaskService = require("../services/task.service");
const { runProducer } = require("./producer");
const kafka = new Kafka({
  clientId: "task-services",
  brokers: ["localhost:9092"],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "task-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", parsedMessage);
      switch (topic) {
        case assignmentTopicsContinuous.getTaskInformation:
          if (parsedMessage !== null) {
            console.log("After:::", parsedMessage);
            const assignmentRequestResultPromises = parsedMessage.map(
              async (item) => {
                return await TaskService.getListDetailTaskByTaskProperty(item);
              }
            );
            const assignmentRequestResults = await Promise.all(
              assignmentRequestResultPromises
            );
            try {
              runProducer(
                assignmentProducerTopic.receivedTaskInformation,
                assignmentRequestResults
              );
            } catch (err) {
              console.log(err);
            }
          }
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};
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

module.exports = { runConsumerOnDemand, continuousConsumer };
