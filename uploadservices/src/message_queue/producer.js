// producer.js
"use strict";
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "user-services",
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
    console.log(`Message sent to topic ${topic}:`, message);
  } catch (error) {
    console.error("Error in producing message:", error);
  } finally {
    await producer.disconnect();
  }
};

module.exports = { runProducer };
