"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const { uploadTopicsContinuous } = require("../configs/kafkaUploadTopic");
const TaskService = require("../services/task.service");
const {
  assignmentTopicsContinuous,
} = require("../configs/kafkaAssignmentTopic/consumer/assignment.consumer.topic.config");
const kafka = new Kafka({
  clientId: "task-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "task-continuous-group" });
  await consumer.connect();

  await consumer.subscribe({
    topics: convertObjectToArray(uploadTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsContinuous),
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log("Before handle :::", parsedMessage);

        switch (topic) {
          case uploadTopicsContinuous.uploadFileForTask: {
            await TaskService.update(
              {
                task_id: parsedMessage.task_id,
                data: { document: parsedMessage.file },
              },
              parsedMessage.modifiedBy
            );
            break;
          }
          case uploadTopicsContinuous.deleteTaskFileInCloud: {
            await TaskService.deleteFile(parsedMessage);
            break;
          }
          case assignmentTopicsContinuous.forceDeleteProject: {
            await TaskService.deleteMultiple(parsedMessage);
          }
          default:
            console.log("Topic không được xử lý:", topic);
        }
        // Gọi heartbeat để giữ kết nối sống nếu cần
        await heartbeat();
      } catch (error) {
        console.error(
          `[Kafka] Error processing message in topic ${topic}:`,
          error.message
        );
        console.error(error.stack);
      }
    },
  });
};

module.exports = { continuousConsumer };
