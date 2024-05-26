"use strict";
const { Kafka, logLevel } = require("kafkajs");

const kafka = new Kafka({
  clientId: "department-services",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const runProducer = async (message) => {
  await producer.connect();
  await producer.send({
    topic: "department-to-user",
    messages: [{ value: `${message}` }],
  });
  await producer.disconnect();
};

module.exports = runProducer;
