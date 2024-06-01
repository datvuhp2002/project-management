const { Kafka } = require("kafkajs");
const { TaskTopicsOnDemand } = require("../configs/kafkaTaskTopic");
const { convertObjectToArray } = require("../utils");

const kafka = new Kafka({
  clientId: "assignment-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({
  groupId: "assignment-task-on-demand-group",
});
const runConsumerTaskOnDemand = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(TaskTopicsOnDemand),
    fromBeginning: false,
  });
  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({ topic, partition, message }) => {
          const parsedMessage = JSON.parse(message.value.toString());
          console.log(parsedMessage);
          resolve(parsedMessage);
          consumer.disconnect();
        },
      })
      .catch(reject);
  });
};

module.exports = { runConsumerTaskOnDemand };
