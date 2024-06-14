const {
  taskTopicsOnDemand,
  taskTopicsContinuous,
} = require("./consumer/task.consumer.topic.config");
const { taskProducerTopic } = require("./producer/task.producer.topic.config");
module.exports = {
  taskProducerTopic,
  taskTopicsOnDemand,
  taskTopicsContinuous,
};
