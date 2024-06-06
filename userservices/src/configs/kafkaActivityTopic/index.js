const {
  activityTopicsContinuous,
  activityTopicsOnDemand,
} = require("./consumer/activity.consumer.topic.config");
const {
  activityProducerTopic,
} = require("./producer/activity.producer.topic.config");

module.exports = {
  activityTopicsContinuous,
  activityTopicsOnDemand,
  activityProducerTopic,
};
