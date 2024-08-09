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
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const parsedMessage = JSON.parse(message.value.toString());
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
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = { continuousConsumer };
