"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { userTopicsContinuous } = require("../configs/kafkaUserTopic");
const DepartmentService = require("../services/department.service");

const kafka = new Kafka({
  clientId: "department-services",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "department-continuous-group" });

const continuousConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsContinuous),
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
          case (userTopicsContinuous.deleteUser,
          userTopicsContinuous.removeManager): {
            if (parsedMessage) {
              await DepartmentService.deleteManagerId(parsedMessage);
            } else {
              console.warn(
                "Received deleteUser message with invalid data:",
                parsedMessage
              );
            }
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
