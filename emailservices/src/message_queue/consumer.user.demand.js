// const { Kafka } = require("kafkajs");
// const { convertObjectToArray } = require("../utils");
// const { userTopicsOnDemand } = require("../configs/kafkaUserTopic");
// const kafka = new Kafka({
//   clientId: "email-services",
//   brokers: [process.env.KAFKA_BROKER],
// });
// const consumer = kafka.consumer({
//   groupId: "email-on-demand-group",
// });
// const runEmailConsumerOnDemand = async () => {
//   await consumer.connect();
//   await consumer.subscribe({
//     topics: convertObjectToArray(userTopicsOnDemand),
//     fromBeginning: false,
//   });
//   return new Promise((resolve, reject) => {
//     consumer
//       .run({
//         eachMessage: async ({ topic, partition, message }) => {
//           const parsedMessage = JSON.parse(message.value.toString());
//           console.log(parsedMessage);
//           resolve(parsedMessage);
//           consumer.disconnect();
//         },
//       })
//       .catch(reject);
//   });
// };
// module.exports = { runEmailConsumerOnDemand };
"use strict";
const { Kafka } = require("kafkajs");
const { userTopicsOnDemand } = require("../configs/kafkaUserTopic");
const EmailService = require("../services/email.service");

const kafka = new Kafka({
  clientId: "email-services",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "email-on-demand-group" });

const runEmailConsumerOnDemand = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: Object.values(userTopicsOnDemand),
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      console.log(`Received message from topic ${topic}:`, parsedMessage);
      if (topic === "send-email-token") {
        try {
          await EmailService.sendEmailToken({ email: parsedMessage.email });
        } catch (err) {
          console.error("Error in handling message:", err.message);
        }
      } else {
        console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = { runEmailConsumerOnDemand };
