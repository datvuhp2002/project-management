const { Kafka } = require("kafkajs");
const gatewayTopics = require("../configs/gateway.topic.config");
const {
  departmentTopicsContinuous,
  departmentProducerTopic,
} = require("../configs/kafkaDepartmentTopic");
const UserService = require("../services/user.service");
const { runProducer } = require("./producer");
const { convertObjectToArray } = require("../utils");
const {
  assignmentTopicsContinuous,
  assignmentProducerTopic,
} = require("../configs/kafkaAssignmentTopic");
const { uploadTopicsContinuous } = require("../configs/kafkaUploadTopic");

const kafka = new Kafka({
  clientId: "user-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "user-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(departmentTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(uploadTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      switch (topic) {
        case departmentTopicsContinuous.selectManagerToDepartment:
          console.log(
            `${departmentTopicsContinuous.selectManagerToDepartment}`,
            parsedMessage
          );
          const { old_manager_id, id, data } = parsedMessage;
          if (old_manager_id !== null) {
            await UserService.update({
              id: old_manager_id,
              data: { department_id: null },
            });
          }
          if (id !== null) {
            await UserService.update({ id, data });
          }
          break;
        case uploadTopicsContinuous.uploadAvatarFromLocal: {
          try {
            await UserService.update({
              id: parsedMessage.user_id,
              data: { avatar: parsedMessage.file },
            });
          } catch (error) {
            console.error("Lỗi khi cập nhật avatar:", error);
          }
          break;
        }
        case departmentTopicsContinuous.addStaffIntoDepartment:
          console.log(
            `${departmentTopicsContinuous.addStaffIntoDepartment}`,
            parsedMessage
          );
          const { list_user_ids, department_id } = parsedMessage;
          await UserService.addUserIntoDepartment(
            { list_user_ids },
            department_id
          );
          break;
        case departmentTopicsContinuous.removeStaffOutOfDepartment:
          await UserService.removeStaffFromDepartmentHasBeenDeleted(
            parsedMessage
          );
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};
module.exports = { continuousConsumer };
