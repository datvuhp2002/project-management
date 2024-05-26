"use strict";
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "user-services",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const getDepartmentName = async (messages) => {
  try {
    await producer.connect();
    await producer.send({
      topic: "department-to-user", // Sử dụng cùng một topic với consumer
      messages: [{ value: `${messages}` }],
    });
  } finally {
    await producer.disconnect();
  }
};
const runProducer = async (topic, message) => {
  try {
    await producer.connect();
    await producer.send({
      topic: topic,
      messages: [{ value: message }],
    });
  } catch (error) {
    console.error("Error in producing message:", error);
  } finally {
    await producer.disconnect();
  }
};

module.exports = { getDepartmentName, runProducer };
