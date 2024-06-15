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
      const parsedMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", parsedMessage);
      switch (topic) {
        case userTopicsContinuous.deleteUser:
          if (parsedMessage !== null) {
            return await DepartmentService.deleteManagerId(parsedMessage);
          }
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }

      await heartbeat();
    },
  });
};

module.exports = { continuousConsumer };
