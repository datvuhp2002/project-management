const { Kafka } = require("kafkajs");
const {
  notificationProducerTopic,
  notificationTopicsContinuous,
} = require("../config/kafkaNotificationTopic");
const { convertObjectToArray } = require("../utils/index");

const kafka = new Kafka({
  clientId: "gateway-services",
  brokers: [process.env.KAFKA_BROKER],
});

const batchSize = 10; // Chỉ định kích thước của mỗi batch

const continuousConsumer = async (io, userSockets) => {
  const consumer = kafka.consumer({ groupId: "gateway-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(notificationTopicsContinuous),
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log("Received message:", parsedMessage);

        switch (topic) {
          case notificationTopicsContinuous.newNoti: {
            const { user_list, ...notificationData } = parsedMessage;

            // Tách user_list thành các batch
            for (let i = 0; i < user_list.length; i += batchSize) {
              const batch = user_list.slice(i, i + batchSize);
              batch.forEach((userId) => {
                const socketId = userSockets.get(userId);
                if (socketId) {
                  io.to(socketId).emit("new-noti", notificationData);
                  console.log(`Sent notification to user ${userId}`);
                } else {
                  console.log(`User ${userId} is not connected`);
                }
              });

              await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
            }
            break;
          }
          default:
            break;
        }
        await heartbeat();
      } catch (error) {
        console.error(
          `[Kafka] Error processing message from topic ${topic}:`,
          error.message
        );
        console.error(error.stack);
      }
    },
  });
};

module.exports = { continuousConsumer };
