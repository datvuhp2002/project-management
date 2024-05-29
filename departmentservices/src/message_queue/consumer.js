const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "department-services",
  brokers: ["localhost:9092"],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "department-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topic: "user-delete-manager",
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const praseMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", praseMessage);
      // Xử lý tin nhắn dựa vào topic
      switch (topic) {
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};
const runConsumerOnDemand = async () => {
  const consumer = kafka.consumer({ groupId: "department-on-demand-group" });
  await consumer.connect();
  await consumer.subscribe({
    topic: "user-to-department",
    fromBeginning: false,
  });

  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log(JSON.parse(message.value.toString()));
          switch (topic) {
            case "user-to-department":
              const result = JSON.parse(message.value.toString());
              resolve(result.departmentRequestResults);
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

module.exports = { runConsumerOnDemand, continuousConsumer };
