"use strict";
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "upload-services",
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();
const runProducer = async (topic, message) => {
  try {
    await producer.connect();
    await producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.error("Error in producing message:", error);
  } finally {
    await producer.disconnect();
  }
};
module.exports = { runProducer };
