"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { userTopicsContinuous } = require("../configs/kafkaUserTopic");
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
    topics: convertObjectToArray(userTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(taskTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", parsedMessage);
      switch (topic) {
        case taskTopicsContinuous.taskCreated: {
          const { createdBy, description, ...data } = parsedMessage;
          data.description = `Task '${description}' đã được tạo bởi: ${createdBy}`;
          await ActivityServices.create(data, createdBy);
          break;
        }
        case taskTopicsContinuous.taskUpdated: {
          const { modifiedBy, description, ...data } = parsedMessage;
          data.description = `Task '${description}' đã được cập nhật bởi: ${modifiedBy}`;
          await ActivityServices.create(data, modifiedBy);
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
