"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { taskTopicsContinuous } = require("../configs/kafkaTaskTopic");
const ActivityServices = require("../services/activity.service");

const kafka = new Kafka({
  clientId: "activity-services",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "activity-continuous-group" });

const continuousConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(taskTopicsContinuous),
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log(
          `Received message from topic: ${topic}, partition: ${partition}`
        );
        console.log("Message content:", parsedMessage);

        switch (topic) {
          case taskTopicsContinuous.taskCreated: {
            const { createdBy, name, ...data } = parsedMessage;
            data.description = `Task '${name}' has been created.`;
            await ActivityServices.create(data, createdBy);
            break;
          }
          case taskTopicsContinuous.taskUpdated: {
            const { modifiedBy, name, ...data } = parsedMessage;
            data.description = `Task '${name}' has been updated.`;
            await ActivityServices.create(data, modifiedBy);
            break;
          }
          default:
            console.log("Unhandled topic:", topic);
        }
        await heartbeat();
      } catch (err) {
        console.error("Error handling message:", err);
      }
    },
  });
};

module.exports = { continuousConsumer };
