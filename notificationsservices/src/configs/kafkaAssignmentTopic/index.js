const {
  assignmentTopicsContinuous,
} = require("./consumer/assignment.consumer.topic.config.js");
const {
  assignmentProducerTopic,
} = require("./producer/assignment.producer.topic.config.js");
module.exports = {
  assignmentProducerTopic,
  assignmentTopicsContinuous,
};
