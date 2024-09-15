const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "gateway-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async (io) => {
  const consumer = kafka.consumer({ groupId: "gateway-continuous-group" });
  await consumer.connect();

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log("Received message:", topic, parsedMessage);
        // Phát thông báo tới tất cả các client qua Socket.io
        io.emit("newNotification", {
          topic,
          message: parsedMessage,
        });
        // Xử lý thông báo theo topic (nếu cần)
        switch (topic) {
          case "department-updated":
            // Phát thông báo đặc biệt chỉ cho các phòng ban liên quan
            io.emit("departmentUpdated", parsedMessage);
            break;
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
