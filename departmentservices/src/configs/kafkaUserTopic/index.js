const {
  userTopicsContinuous,
} = require("./consumer/user.consumer.topic.config");
const { userProducerTopic } = require("./producer/user.producer.topic.config");
module.exports = {
  userProducerTopic,
  userTopicsContinuous,
};
