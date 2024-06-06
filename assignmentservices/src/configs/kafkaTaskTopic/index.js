const { taskProducerTopic } = require("./producer/task.producer.topic.config");
const {
  taskTopicsOnDemand,
  taskTopicsContinuous,
} = require("./consumer/task.consumer.topic.config");
module.exports = {
  taskProducerTopic,
  taskTopicsOnDemand,
  taskTopicsContinuous,
};
