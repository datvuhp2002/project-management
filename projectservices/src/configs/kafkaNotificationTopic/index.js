const {
  notificationTopicsContinuous,
} = require("./consumer/notification.consumer.topic.config");
const {
  notificationProducerTopic,
} = require("./producer/notification.producer.topic.config");
module.exports = {
  notificationProducerTopic,
  notificationTopicsContinuous,
};
