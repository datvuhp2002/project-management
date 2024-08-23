const { Kafka } = require("kafkajs");
const {
  departmentTopicsContinuous,
} = require("../configs/kafkaDepartmentTopic");
const UserService = require("../services/user.service");
const { convertObjectToArray } = require("../utils");
const { uploadTopicsContinuous } = require("../configs/kafkaUploadTopic");
const { projectTopicsContinuous } = require("../configs/kafkaProjectTopic");
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
              await UserService.updateWithoutModified({
                id: old_manager_id,
                data: { department_id: null },
              });
            }

            if (id !== null) {
              await UserService.updateWithoutModified({ id, data });
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

          case departmentTopicsContinuous.removeStaffOutOfDepartment: {
            await UserService.removeStaffFromDepartmentHasBeenDeleted(
              parsedMessage
            );
            break;
          }
          case projectTopicsContinuous.addProjectManagerForProject: {
            await UserService.updateWithoutModified({
              id: parsedMessage,
              data: {
                role: "PROJECT_MANAGER",
              },
            });
          }
          case projectTopicsContinuous.changeProjectManager: {
            const { new_project_manager_id, old_project_manager_id } =
              parsedMessage;
            // Update the roles concurrently
            await Promise.all([
              UserService.updateWithoutModified({
                id: old_project_manager_id,
                data: { role: "STAFF" },
              }),
              UserService.updateWithoutModified({
                id: new_project_manager_id,
                data: { role: "PROJECT_MANAGER" },
              }),
            ]);
          }
          case projectTopicsContinuous.removeProjectManagerForProject: {
            await UserService.updateWithoutModified({
              id: parsedMessage,
              data: { role: "STAFF" },
            });
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
