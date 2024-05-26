const { Kafka } = require("kafkajs");
const DepartmentService = require("../../services/department.service");
const runProducer = require("./producer");
const kafka = new Kafka({
  clientId: "department-services",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "department-group" });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "user-to-department",
    fromBeginning: true,
  });
  await consumer.subscribe({
    topic: "user-need-department-name",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      });
      console.log({
        topic: topic,
      });
      if (topic === "user-need-department-name") {
        console.log("DEPARTMENT:::", message.value.toString());
        // const departmentDetail = await DepartmentService.detail(message.value);
        const departmentDetail = await DepartmentService.detail(
          message.value.toString()
        );
        await runProducer(JSON.stringify(departmentDetail));
      }
    },
  });
};

module.exports = runConsumer;
