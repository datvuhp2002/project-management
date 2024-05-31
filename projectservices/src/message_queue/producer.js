"use strict";
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "project-services",
  brokers: ["localhost:9092"],
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
