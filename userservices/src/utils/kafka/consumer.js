const { Kafka } = require("kafkajs");
const UserService = require("../../services/user.service");
const { runProducer } = require("./producer");
const gatewayTopics = require("../../configs/gateway.topic.config");

const kafka = new Kafka({
  clientId: "user-services",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "user-group" });
const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: gatewayTopics,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Xử lý tin nhắn dựa vào topic
      switch (topic) {
        case "find-by-email":
          // Tạo một thể hiện của UserService và sử dụng phương thức forgetPassword
          const userData = JSON.parse(message.value.toString());
          const newPassword = await UserService.forgetPassword(userData.email);
          await runProducer(
            "password-reset-response",
            JSON.stringify(newPassword)
          );
          break;
        case "change-password":
          // Tạo một thể hiện của UserService và sử dụng phương thức changePassword
          const passwordData = JSON.parse(message.value.toString());
          const changedPassword = await UserService.changePassword(
            passwordData
          );
          await runProducer(
            "password-change-response",
            JSON.stringify(changedPassword)
          );
          break;
        // Xử lý các topic khác nếu cần
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = runConsumer;
