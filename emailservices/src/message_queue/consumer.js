"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { userTopicsContinuous } = require("../configs/kafkaUserTopic");
const EmailService = require("../services/email.service");
const kafka = new Kafka({
  clientId: "email-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({ groupId: "email-continuous-group" });

const continuousConsumer = async () => {
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
        case userTopicsContinuous.sendEmailToken: {
          await EmailService.forgetPassword({ email: parsedMessage });
          break;
        }
        default:
          console.log("Topic không được xử lý:", topic);
      }

      await heartbeat();
    },
  });
};

module.exports = { continuousConsumer };
