const { taskProducerTopic } = require("./producer/task.producer.topic.config");
const {
  taskTopicsContinuous,
} = require("./consumer/task.consumer.topic.config");
module.exports = {
  taskProducerTopic,
  taskTopicsContinuous,
};
