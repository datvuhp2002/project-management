const { Kafka } = require("kafkajs");
const { userTopicsOnDemand } = require("../configs/kafkaUserTopic");
const { convertObjectToArray } = require("../utils");

const kafka = new Kafka({
  clientId: "assignment-services",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({
  groupId: "assignment-user-on-demand-group",
});
const runConsumerUserOnDemand = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsOnDemand),
    fromBeginning: false,
  });
  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({ topic, partition, message }) => {
          const parsedMessage = JSON.parse(message.value.toString());
          console.log(parsedMessage);
          resolve(parsedMessage);
          consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
          consumer.disconnect();
        },
      })
      .catch(reject);
  });
};

module.exports = { runConsumerUserOnDemand };
