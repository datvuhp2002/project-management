const { Kafka } = require("kafkajs");
const {
  projectTopicsContinuous,
  projectProducerTopic,
} = require("../configs/kafkaProjectTopic");
const AssignmentServices = require("../services/assignment.service");
const { runProducer } = require("./producer");
const { convertObjectToArray } = require("../utils");

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
                  item.project_property_id
                );
              const list_task_property =
                await AssignmentServices.getTotalTaskPropertyWithStatusFromProject(
                  item.project_property_id
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
        default:
          console.log("Topic không được xử lý:", topic);
      }
    },
  });
};

module.exports = { continuousConsumer };
