const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils");
const { runProducer } = require("../message_queue/producer");
const { deleteFile } = require("../services/upload.services");
const { taskTopicsContinuous } = require("../configs/kafkaTaskTopic");
const { projectTopicsContinuous } = require("../configs/kafkaProjectTopic");

const kafka = new Kafka({
  clientId: "upload-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "upload-continuous-group" });
  await consumer.connect();

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        switch (topic) {
          default:
            console.log("Unhandled topic:", topic);
        }
      } catch (err) {
        console.error("Error handling message:", err);
      }
    },
  });
};

module.exports = { continuousConsumer };
