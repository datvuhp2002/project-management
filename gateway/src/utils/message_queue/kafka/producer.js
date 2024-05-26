const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "gateway-services",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const sendMessage = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};

module.exports = sendMessage;
