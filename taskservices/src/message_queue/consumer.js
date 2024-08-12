"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const {
  uploadTopicsContinuous,
  uploadProducerTopic,
} = require("../configs/kafkaUploadTopic");
const TaskService = require("../services/task.service");
const { runProducer } = require("./producer");
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
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      switch (topic) {
        case uploadTopicsContinuous.uploadFileForTask:
          console.log(parsedMessage);
          await TaskService.update(
            {
              task_id: parsedMessage.task_id,
              data: { document: parsedMessage.file },
            },
            parsedMessage.modifiedBy
          );
          break;
        case uploadTopicsContinuous.deleteTaskFileInCloud:
          await TaskService.deleteFile(parsedMessage);
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = { continuousConsumer };
