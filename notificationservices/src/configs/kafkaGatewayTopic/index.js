const {
  gatewayTopicsContinuous,
} = require("./consumer/gateway.consumer.topic.config");
const {
  gatewayProducerTopic,
} = require("./producer/gateway.producer.topic.config");
module.exports = {
  gatewayProducerTopic,
  gatewayTopicsContinuous,
};
