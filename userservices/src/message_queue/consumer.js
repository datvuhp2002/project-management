const { Kafka } = require("kafkajs");
const gatewayTopics = require("../configs/gateway.topic.config");
const departmentTopics = require("../configs/department.topic.config");
const UserService = require("../services/user.service");
const { runProducer } = require("./producer");
const { convertObjectToArray } = require("../utils");
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
  await consumer.subscribe({
    topics: convertObjectToArray(departmentTopics),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topic: "department-to-user",
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const praseMessage = JSON.parse(message.value.toString());
      console.log("Before handle :::", praseMessage);
      // Xử lý tin nhắn dựa vào topic
      switch (topic) {
        case departmentTopics.getAllUserInDepartmentAndDetailManager:
          const departmentData = JSON.parse(message.value.toString());
          const departmentRequestResultPromises = departmentData.map(
            async (item) => {
              return await UserService.getDetailManagerAndTotalStaffInDepartment(
                item
              );
            }
          );
          const departmentRequestResults = await Promise.all(
            departmentRequestResultPromises
          );
          try {
            await runProducer("user-to-department", {
              departmentRequestResults,
            });
          } catch (err) {
            console.log(err);
          }
          break;
        case departmentTopics.selectManagerToDepartment:
          console.log(praseMessage);
          console.log(await UserService.update(praseMessage));
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};
module.exports = { runConsumer };
