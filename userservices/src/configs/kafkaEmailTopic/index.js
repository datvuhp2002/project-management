const {
  emailTopicsContinuous,
  emailTopicsOnDemand,
} = require("./consumer/email.consumer.topic.config");
const {
  emailProducerTopic,
} = require("./producer/email.producer.topic.config");

module.exports = {
  emailTopicsContinuous,
  emailTopicsOnDemand,
  emailProducerTopic,
};
