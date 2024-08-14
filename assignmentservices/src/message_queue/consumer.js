const { Kafka } = require("kafkajs");
const {
  projectTopicsContinuous,
  projectProducerTopic,
} = require("../configs/kafkaProjectTopic");
const AssignmentServices = require("../services/assignment.service");
const { runProducer } = require("./producer");
const { convertObjectToArray } = require("../utils");
const {
  userTopicsContinuous,
  userProducerTopic,
} = require("../configs/kafkaUserTopic");
const {
  taskTopicsContinuous,
  taskProducerTopic,
} = require("../configs/kafkaTaskTopic");

const kafka = new Kafka({
  clientId: "assignment-services",
  brokers: [process.env.KAFKA_BROKER],
});
const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "assignment-continuous-group" });
  await consumer.connect();

  // Subscribe to continuous topics
  await consumer.subscribe({
    topics: convertObjectToArray(projectTopicsContinuous),
    fromBeginning: false,
  });
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
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log(
          `Received message from topic: ${topic}, partition: ${partition}`
        );
        console.log("Message content:", parsedMessage);
        switch (topic) {
          default:
            console.log("Unhandled topic:", topic);
        }
        await heartbeat(); // Ensure Kafka knows that the consumer is still alive
      } catch (err) {
        console.error("Error handling message:", err);
      }
    },
  });
};

module.exports = { continuousConsumer };
