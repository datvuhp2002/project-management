// "use strict";
// const { Kafka } = require("kafkajs");
// const { convertObjectToArray } = require("../utils/index");
// const { uploadTopicsContinuous } = require("../configs/kafkaClientTopic");
// const kafka = new Kafka({
//   clientId: "upload-services",
//   brokers: [process.env.KAFKA_BROKER],
// });
// const consumer = kafka.consumer({ groupId: "upload-continuous-group" });

// const continuousConsumer = async () => {
//   await consumer.connect();
//   await consumer.subscribe({
//     topics: convertObjectToArray(uploadTopicsContinuous),
//     fromBeginning: false,
//   });
//   await consumer.run({
//     eachMessage: async ({ topic, partition, message, heartbeat }) => {
//       const parsedMessage = JSON.parse(message.value.toString());
//       console.log("Before handle :::", parsedMessage);
//       switch (topic) {
//         default:
//           console.log("Topic không được xử lý:", topic);
//       }

//       await heartbeat();
//     },
//   });
// };

// // module.exports = { continuousConsumer };
// "use strict";
// const { Kafka } = require("kafkajs");
// const { convertObjectToArray } = require("../utils/index");
// const { uploadTopicsContinuous } = require("../configs/kafkaUserTopic");
// const UploadService = require("../services/upload.services");

// const kafka = new Kafka({
//   clientId: "upload-services",
//   brokers: [process.env.KAFKA_BROKER],
// });
// const consumer = kafka.consumer({ groupId: "upload-continuous-group" });

// const continuousConsumer = async () => {
//   try {
//     await consumer.connect();
//     await consumer.subscribe({
//       topics: convertObjectToArray(uploadTopicsContinuous),
//       fromBeginning: false,
//     });
//     await consumer.run({
//       eachMessage: async ({ topic, partition, message, heartbeat }) => {
//         try {
//           const parsedMessage = JSON.parse(message.value.toString());
//           console.log("Before handle :::", parsedMessage);
//           switch (topic) {
//             case uploadTopicsContinuous.uploadAvatarFromLocal: {
//               await EmailService.forgetPassword({ email: parsedMessage });
//               break;
//             }
//             default:
//               console.log("Topic không được xử lý:", topic);
//           }

//           await heartbeat();
//         }
//       },
//     });
//   } catch (error) {
//     console.error("Error in continuousConsumer:", error.message);
//   }
// };

// const continuousConsumer = async () => {
//   await consumer.connect();
//   await consumer.subscribe({
//     topics: convertObjectToArray(uploadTopicsContinuous),
//     fromBeginning: false,
//   });
//   await consumer.run({
//     eachMessage: async ({ topic, partition, message, heartbeat }) => {
//       const parsedMessage = JSON.parse(message.value.toString());
//       console.log("Before handle :::", parsedMessage);
//       switch (topic) {
//         case uploadTopicsContinuous.uploadAvatarFromLocal: {
//           await UploadService.uploadAvatarFromLocal({ parsedMessage });
//           break;
//         }
//         default:
//           console.log("Topic không được xử lý:", topic);
//       }

//       await heartbeat();
//     },
//   });
// };

// module.exports = { continuousConsumer };
// message_queue/consumer.js
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const { userTopicsContinuous } = require("../configs/kafkaUserTopic");
const UploadService = require("../services/upload.services");

const kafka = new Kafka({
  clientId: "upload-services",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "upload-continuous-group" });

const continuousConsumer = async () => {
  try {
    await consumer.connect();
    console.log("Connected to Kafka");

    const topics = convertObjectToArray(userTopicsContinuous);
    console.log("Topics to subscribe:", topics);

    await consumer.subscribe({ topics, fromBeginning: false });
    console.log("Subscribed to topics:", topics);

    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat }) => {
        try {
          const parsedMessage = JSON.parse(message.value.toString());
          console.log("Before handle :::", parsedMessage);

          switch (topic) {
            case userTopicsContinuous.uploadAvatarFromLocal:
              console.log("Handling topic:", topic);
              await UploadService.uploadAvatarFromLocal(parsedMessage);
              break;
            default:
              console.log("Topic không được xử lý:", topic);
          }

          await heartbeat();
        } catch (err) {
          console.error("Error handling message:", err);
        }
      },
    });
  } catch (error) {
    console.error("Error in continuousConsumer:", error.message);
  }
};

module.exports = { continuousConsumer };
