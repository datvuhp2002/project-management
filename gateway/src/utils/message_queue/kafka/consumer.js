const { Kafka } = require("kafkajs");
const {
  OK,
  CREATED,
  SuccessResponse,
} = require("../../../core/success.response");
const AccessService = require("../../../services/access.service");
const createTokenPair = require("../../../auth/authUtils");
const kafka = new Kafka({
  clientId: "gateway-services",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "gateway-group" });

const consumeMessages = async (listTopic) => {
  await consumer.connect();
  await consumer.subscribe({
    topics: listTopic,
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      switch (topic) {
        case "gateway-find-by-email":
          // Tạo một thể hiện của UserService và sử dụng phương thức forgetPassword
          console.log("DATA:::", data);
          try {
            const tokens = await createTokenPair(
              data,
              process.env.PUBLIC_KEY,
              process.env.PRIVATE_KEY
            );
          } catch (error) {
            console.error("Error generating token pair:", error);
          }
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = consumeMessages;
