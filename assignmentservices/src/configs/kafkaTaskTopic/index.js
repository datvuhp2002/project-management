const { taskProducerTopic } = require("./producer/task.producer.topic.config");
const { TaskTopicsOnDemand } = require("./consumer/task.consumer.topic.config");
module.exports = {
  taskProducerTopic,
  TaskTopicsOnDemand,
};
