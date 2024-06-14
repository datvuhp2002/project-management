const {
  departmentTopicsContinuous,
  departmentTopicsOnDemand,
} = require("./consumer/department.consumer.topic.config");
const {
  departmentProducerTopic,
} = require("./producer/department.producer.topic.config");

module.exports = {
  departmentTopicsContinuous,
  departmentTopicsOnDemand,
  departmentProducerTopic,
};
