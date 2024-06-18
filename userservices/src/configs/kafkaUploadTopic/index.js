const {
  uploadTopicsContinuous,
  uploadTopicsOnDemand,
} = require("./consumer/upload.consumer.topic.config");
const {
  uploadProducerTopic,
} = require("./producer/upload.producer.topic.config");

module.exports = {
  uploadTopicsContinuous,
  uploadTopicsOnDemand,
  uploadProducerTopic,
};
