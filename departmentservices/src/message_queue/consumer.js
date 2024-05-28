const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "department-services",
  brokers: ["localhost:9092"],
});

const runAndGetDataInConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "department-group" });

  await consumer.connect();
  await consumer.subscribe({
    topic: "user-to-department",
    fromBeginning: true,
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
              break;
            default:
              console.log("Topic không được xử lý:", topic);
          }
        },
      })
      .catch(reject);
  });
};

module.exports = { runAndGetDataInConsumer };
