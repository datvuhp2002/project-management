"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { userTopicsContinuous } = require("../configs/kafkaUserTopic");
const EmailService = require("../services/email.service");

const kafka = new Kafka({
  clientId: "email-services",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "email-group" });

const continuousConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsContinuous),
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log("Received message:", topic, parsedMessage);

        switch (topic) {
          case userTopicsContinuous.sendEmailToken: {
            await EmailService.sendEmailToken(parsedMessage);
            break;
          }
          case userTopicsContinuous.createUser: {
            await EmailService.sendEmailCreateUser(parsedMessage);
            break;
          }
          default:
            console.log("Unhandled topic:", topic);
        }

        await heartbeat();
      } catch (error) {
        // Log the error details
        console.error(
          `[Kafka] Error processing message from topic ${topic}:`,
          error.message
        );
        console.error(error.stack);
      }
    },
  });
};

module.exports = { continuousConsumer };
