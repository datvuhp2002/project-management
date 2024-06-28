const {
  projectTopicsContinuous,
  projectTopicsOnDemand,
} = require("./consumer/project.consumer.topic.config");
const {
  projectProducerTopic,
} = require("./producer/project.producer.topic.config");

module.exports = {
  projectTopicsContinuous,
  projectTopicsOnDemand,
  projectProducerTopic,
};
