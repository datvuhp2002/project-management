const {
  assignmentTopicsContinuous,
  assignmentTopicsOnDemand,
} = require("./consumer/assignment.consumer.topic.config");
const {
  assignmentProducerTopic,
} = require("./producer/assignment.producer.topic.config");

module.exports = {
  assignmentTopicsContinuous,
  assignmentTopicsOnDemand,
  assignmentProducerTopic,
};
