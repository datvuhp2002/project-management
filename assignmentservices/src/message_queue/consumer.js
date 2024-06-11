const { Kafka } = require("kafkajs");
const {
  projectTopicsContinuous,
  projectProducerTopic,
} = require("../configs/kafkaProjectTopic");
const AssignmentServices = require("../services/assignment.service");
const { runProducer } = require("./producer");
const { convertObjectToArray } = require("../utils");
const {
  userTopicsContinuous,
  userProducerTopic,
} = require("../configs/kafkaUserTopic");
const {
  taskTopicsContinuous,
  taskProducerTopic,
} = require("../configs/kafkaTaskTopic");

const kafka = new Kafka({
  clientId: "assignment-services",
  brokers: [process.env.KAFKA_BROKER],
});

const continuousConsumer = async () => {
  const consumer = kafka.consumer({ groupId: "assignment-continuous-group" });
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(projectTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(taskTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const parsedMessage = JSON.parse(message.value.toString());
      console.log("Before handle:::", parsedMessage);
      switch (topic) {
        case projectTopicsContinuous.getProjectInformationFromAssignment:
          const projectRequestResultPromises = await parsedMessage.map(
            async (item) => {
              const list_user_property =
                await AssignmentServices.getAllUserPropertyFromProject(
                  item.project_id
                );
              const list_task_property =
                await AssignmentServices.getTotalTaskPropertyWithStatusFromProject(
                  item.project_id
                );
              return {
                total_user: list_user_property.length,
                total_task: list_task_property,
              };
            }
          );
          const projectRequestResults = await Promise.all(
            projectRequestResultPromises
          );
          try {
            await runProducer(
              projectProducerTopic.receiveProjectInformationFromAssignment,
              projectRequestResults
            );
          } catch (err) {
            console.log(err);
          }
          break;
        case userTopicsContinuous.getListUserPropertyFromProject:
          const resultUserTopic =
            await AssignmentServices.getAllUserPropertyFromProject(
              parsedMessage
            );
          console.log("result:::", resultUserTopic);
          try {
            await runProducer(
              userProducerTopic.receivedListUserPropertyFromProject,
              resultUserTopic
            );
          } catch (err) {
            console.log(err.message);
          }
          break;
        case taskTopicsContinuous.getListTaskFromProject:
          console.log(parsedMessage);
          const resultTaskTopic =
            await AssignmentServices.getAllTaskFromProject(parsedMessage);
          console.log("result:::", resultTaskTopic);
          try {
            await runProducer(
              taskProducerTopic.receivedTaskFromProject,
              resultTaskTopic
            );
          } catch (err) {
            console.log(err.message);
          }
          break;
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = { continuousConsumer };
