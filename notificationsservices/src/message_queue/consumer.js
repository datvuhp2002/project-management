"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const NotificationService = require("../services/notification.service");
const {
  departmentTopicsContinuous,
} = require("../configs/kafkaDepartmentTopic");
const { GetListStaffInDepartment } = require("../services/grpcClient.services");

const kafka = new Kafka({
  clientId: "notification-services",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "notification-continuous-group" });

const continuousConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(departmentTopicsContinuous),
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
          case departmentTopicsContinuous.updateDepartment: {
            const notification = await NotificationService.create(
              parsedMessage.message,
              parsedMessage.modifiedBy
            );
            if (notification) {
              const user_ids = await GetListStaffInDepartment(
                parsedMessage.department_id
              );
            }
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
