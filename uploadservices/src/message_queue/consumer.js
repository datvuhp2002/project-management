"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { uploadTopicsContinuous } = require("../configs/kafkaClientTopic");
const kafka = new Kafka({
  clientId: "upload-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({ groupId: "upload-continuous-group" });

const continuousConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(uploadTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", parsedMessage);
      switch (topic) {
        default:
          console.log("Topic không được xử lý:", topic);
      }

      await heartbeat();
    },
  });
};

module.exports = { continuousConsumer };
