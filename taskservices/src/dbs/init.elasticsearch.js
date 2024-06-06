"use strict";
const { Client } = require("@elastic/elasticsearch");

let clients = {}; // multiple connections
const instanceEventListeners = async (elasticClient) => {
  try {
    await elasticClient.ping();
    console.log(`Successfully connecting to elasticsearch`);
  } catch (err) {
    console.log(`Error connecting to elasticsearch`, err);
  }
};
const init = ({
  ELASTICSEARCH_IS_ENABLED,
  ELASTICSEARCH_HOSTS = process.env.ELASTICSEARCH_HOSTS,
}) => {
  if (ELASTICSEARCH_IS_ENABLED) {
    const elasticClient = new Client({ node: ELASTICSEARCH_HOSTS });
    clients.elasticClient = elasticClient;
    //handle connect
    instanceEventListeners(elasticClient);
  }
};

const getClients = () => clients;

const closeConnections = () => {};
module.exports = {
  init,
  getClients,
  closeConnections,
};
