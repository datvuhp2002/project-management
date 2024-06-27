const {
  taskTopicsContinuous,
  taskTopicsOnDemand,
} = require("./consumer/task.topic.config");
const { taskProducerTopic } = require("./producer/task.producer.topic.config");

module.exports = {
  taskTopicsContinuous,
  taskTopicsOnDemand,
  taskProducerTopic,
};
