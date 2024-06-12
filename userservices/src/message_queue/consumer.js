const { Kafka } = require("kafkajs");
const gatewayTopics = require("../configs/gateway.topic.config");
const {
  departmentTopicsContinuous,
  departmentProducerTopic,
} = require("../configs/kafkaDepartmentTopic");
const {
  emailTopicsOnDemand,
  emailProducerTopic,
} = require("../configs/kafkaEmailTopic");
const {
  activityTopicsContinuous,
  activityProducerTopic,
} = require("../configs/kafkaActivityTopic");
const UserService = require("../services/user.service");
const { runProducer } = require("./producer");
const { convertObjectToArray } = require("../utils");
const {
  assignmentTopicsContinuous,
  assignmentProducerTopic,
} = require("../configs/kafkaAssignmentTopic");

const kafka = new Kafka({
  clientId: "user-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "user-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(gatewayTopics),
    fromBeginning: true,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(departmentTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(activityTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(activityTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(emailTopicsContinuous),
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      switch (topic) {
        case departmentTopicsContinuous.getAllUserInDepartmentAndDetailManager:
          const departmentData = JSON.parse(message.value.toString());
          console.log("Message receive:::", departmentData);
          const departmentRequestResultPromises = departmentData.map(
            async (item) => {
              return await UserService.getDetailManagerAndTotalStaffInDepartment(
                item,
                false
              );
            }
          );
          const departmentRequestResults = await Promise.all(
            departmentRequestResultPromises
          );
          try {
            await runProducer(
              departmentProducerTopic.informationDepartment,
              departmentRequestResults
            );
          } catch (err) {
            console.log(err);
          }
          break;
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
        case emailTopicsOnDemand.sendEmailToken:
          const sendEmailTokenData = JSON.parse(message.value.toString());
          console.log("Message receive:::", sendEmailTokenData);
          const emailRequestResultPromises = sendEmailTokenData.map(
            async (item) => {
              return await UserService.forgetPassword(item);
            }
          );
          const emailRequestResults = await Promise.all(
            emailRequestResultPromises
          );
          try {
            await runProducer(
              emailProducerTopic.sendEmailToken,
              emailRequestResults
            );
          } catch (err) {
            console.log(err);
          }
          break;
        case assignmentTopicsContinuous.getUserInformation:
          const assignmentRequestResultPromises = parsedMessage.map(
            async (item) => {
              return await UserService.detail(item);
            }
          );
          const assignmentRequestResults = await Promise.all(
            assignmentRequestResultPromises
          );
          console.log(assignmentRequestResults);
          try {
            runProducer(
              assignmentProducerTopic.receivedUserInformation,
              assignmentRequestResults
            );
          } catch (err) {
            console.log(err.message);
          }
          break;
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
        case activityTopicsContinuous.getUserInformationForActivity:
          const activityRequestResultPromises = parsedMessage.map(
            async (item) => {
              return await UserService.detail(item);
            }
          );
          const activityRequestResults = await Promise.all(
            activityRequestResultPromises
          );
          try {
            runProducer(
              activityProducerTopic.receivedInformationActivity,
              activityRequestResults
            );
          } catch (err) {
            console.log(err.message);
          }
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
      await heartbeat();
    },
  });
};
module.exports = { continuousConsumer };
