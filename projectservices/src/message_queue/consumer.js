const { Kafka } = require("kafkajs");
const {
  assignmentTopicsContinuous,
  assignmentTopicsOnDemand,
  assignmentProducerTopic,
} = require("../configs/kafkaAssignmentTopic");
const ProjectServices = require("../services/project.service");
const { runProducer } = require("./producer");
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
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      switch (topic) {
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};
const runConsumerOnDemand = async () => {
  const consumer = kafka.consumer({ groupId: "project-on-demand-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsOnDemand),
    fromBeginning: false,
  });

  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({
          topic,
          partition,
          message,
          commitOffsetsIfNecessary,
        }) => {
          console.log(JSON.parse(message.value.toString()));
          switch (topic) {
            case "abc":
              consumer.disconnect();
              break;
            default:
              console.log("Topic không được xử lý:", topic);
          }
        },
      })
      .catch(reject);
  });
};
module.exports = { continuousConsumer, runConsumerOnDemand };
