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
          await UserService.update({ id, data });
          break;
        case assignmentTopicsContinuous.getUserInformation:
          console.log(parsedMessage);
          const assignmentRequestResultPromises = parsedMessage.map(
            async (item) => {
              return await UserService.getStaffInformationByUserProperty(item);
            }
          );
          const assignmentRequestResults = await Promise.all(
            assignmentRequestResultPromises
          );
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
        default:
          console.log("Topic không được xử lý:", topic);
      }
      await heartbeat();
    },
  });
};
const runConsumerOnDemand = async () => {
  const consumer = kafka.consumer({ groupId: "user-on-demand-group" });
  await consumer.connect();
  // await consumer.subscribe({
  //   topics: convertObjectToArray(userTopicsOnDemand),
  //   fromBeginning: false,
  // });

  return new Promise((resolve, reject) => {
    consumer
      .run({
        eachMessage: async ({
          topic,
          partition,
          message,
          commitOffsetsIfNecessary,
        }) => {
          console.log(JSON.parse(message.value.toString()));
          switch (topic) {
            case "abc":
              consumer.disconnect();
              break;
            default:
              console.log("Topic không được xử lý:", topic);
          }
        },
      })
      .catch(reject);
  });
};
module.exports = { continuousConsumer, runConsumerOnDemand };
