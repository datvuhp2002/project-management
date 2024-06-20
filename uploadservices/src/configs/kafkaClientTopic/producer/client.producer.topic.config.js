const {
  clientTopicsContinuous,
  clientTopicsOnDemand,
} = require("./consumer/client.consumer.topic.config");
const {
  clientProducerTopic,
} = require("./producer/client.producer.topic.config");

module.exports = {
  clientTopicsContinuous,
  clientTopicsOnDemand,
  clientProducerTopic,
};
