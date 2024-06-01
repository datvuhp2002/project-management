const { Kafka } = require("kafkajs");
const {
  assignmentTopicsContinuous,
} = require("../configs/kafkaAssignmentTopic");
const { convertObjectToArray } = require("../utils");
const kafka = new Kafka({
  clientId: "project-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "project-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsContinuous),
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", parsedMessage);
      switch (topic) {
        case assignmentTopicsContinuous.abc:
          if (parsedMessage !== null) {
            console.log("After:::", parsedMessage);
          }
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = { continuousConsumer };
