const { Kafka } = require("kafkajs");
const {
  assignmentTopicsContinuous,
  assignmentTopicsOnDemand,
  assignmentProducerTopic,
} = require("../configs/kafkaAssignmentTopic");
const { convertObjectToArray } = require("../utils");
const kafka = new Kafka({
  clientId: "project-services",
  brokers: ["localhost:9092"],
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
const runConsumerOnDemand = async () => {
  const consumer = kafka.consumer({ groupId: "projects-on-demand-group" });

  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsOnDemand),
    fromBeginning: false,
  });

  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({ topic, partition, message }) => {
          const parsedMessage = JSON.parse(message.value.toString());
          consumer.commitOffsets([
            { topic, partition, offset: message.offset },
          ]);
          resolve(parsedMessage);
          consumer.disconnect();
        },
      })
      .catch(reject);
  });
};

module.exports = { continuousConsumer, runConsumerOnDemand };
