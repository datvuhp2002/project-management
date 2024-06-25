"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { userTopicsContinuous } = require("../configs/kafkaUserTopic");
const uploadService = require("../services/upload.services");
const kafka = new Kafka({
  clientId: "upload-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({ groupId: "upload-continuous-group" });

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
        // case userTopicsContinuous.uploadAvartarFromLocal: {
        //   await uploadService.uploadAvartarFromLocal({ parsedMessage });
        //   break;
        // }
        case userTopicsContinuous.uploadAvartarFromLocal:
          const { user_id, avatar } = parsedMessage;
          if (!user_id || !avatar) {
            console.error("Invalid message format:", parsedMessage);
            return;
          }
          await uploadService.uploadAvartarFromLocal(user_id, avatar);
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
      await heartbeat();
    },
  });
};

module.exports = { continuousConsumer };
