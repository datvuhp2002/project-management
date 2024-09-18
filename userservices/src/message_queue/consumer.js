const { Kafka } = require("kafkajs");
const {
  departmentTopicsContinuous,
} = require("../configs/kafkaDepartmentTopic");
const UserService = require("../services/user.service");
const { convertObjectToArray } = require("../utils");
const { uploadTopicsContinuous } = require("../configs/kafkaUploadTopic");
const { projectTopicsContinuous } = require("../configs/kafkaProjectTopic");
const { runProducer } = require("./producer");
const {
  notificationProducerTopic,
} = require("../configs/kafkaNotificationTopic/producer/notification.producer.topic.config");
const kafka = new Kafka({
  clientId: "user-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "user-continuous-group" });
  await consumer.connect();

  // Subscribe to all topics
  await consumer.subscribe({
    topics: convertObjectToArray(departmentTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(uploadTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(projectTopicsContinuous),
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log("Received message:", topic, parsedMessage);

        switch (topic) {
          case departmentTopicsContinuous.selectManagerToDepartment:
            const { old_manager_id, id, data } = parsedMessage;
            if (old_manager_id !== null) {
              const user = await UserService.updateWithoutModified({
                id: old_manager_id,
                data: { department_id: null },
              });
              await runProducer(
                notificationProducerTopic.notiForRemoveManager,
                {
                  user_id: old_manager_id,
                  message: `Manager ${user.username} are removed from department ${data.department_name}`,
                  modifiedBy: parsedMessage.modifiedBy,
                  department_name: data.department_name,
                  department_id: data.department_id,
                }
              );
            }
            if (id !== null) {
              const user = await UserService.updateWithoutModified({
                id,
                data: { department_id: data.department_id },
              });
              await runProducer(notificationProducerTopic.notiForAddManager, {
                user_id: id,
                message: `${user.username} have become the manager of ${data.department_name} department`,
                modifiedBy: parsedMessage.modifiedBy,
                department_name: data.department_name,
                department_id: data.department_id,
              });
            }
            break;

          case uploadTopicsContinuous.uploadAvatarFromLocal: {
            try {
              await UserService.updateWithoutModified({
                id: parsedMessage.user_id,
                data: { avatar: parsedMessage.file },
              });
            } catch (error) {
              console.error("Error updating avatar:", error);
            }
            break;
          }
          case departmentTopicsContinuous.addStaffIntoDepartment: {
            const { list_user_ids, department_id, department_name, createdBy } =
              parsedMessage;
            const addUserIntoDepartment =
              await UserService.addUserIntoDepartment(
                { list_user_ids },
                department_id
              );
            if (addUserIntoDepartment) {
              await runProducer(
                notificationProducerTopic.notiForAddStaffIntoDepartment,
                {
                  user_list: list_user_ids,
                  message: `You are added to department ${department_name}`,
                  createdBy,
                }
              );
            }
            break;
          }
          case departmentTopicsContinuous.removeStaffOutOfDepartment: {
            const { department_id, department_name, modifiedBy } =
              parsedMessage;
            const list_user_ids_in_department =
              await UserService.getListStaffIdsInDepartment(department_id);
            await UserService.removeStaffFromDepartmentHasBeenDeleted(
              department_id,
              modifiedBy
            );
            await runProducer(
              notificationProducerTopic.notiForRemoveStaffFromDepartment,
              {
                user_list: list_user_ids_in_department,
                message: `You are removed from department ${department_name}`,
                createdBy: modifiedBy,
              }
            );
            break;
          }
          default:
            console.log("Unhandled topic:", topic);
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
