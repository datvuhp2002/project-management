"use strict";
const { Kafka } = require("kafkajs");
const { convertObjectToArray } = require("../utils/index");
const NotificationService = require("../services/notification.service");
const {
  departmentTopicsContinuous,
} = require("../configs/kafkaDepartmentTopic");
const { projectTopicsContinuous } = require("../configs/kafkaProjectTopic");
const { gatewayProducerTopic } = require("../configs/kafkaGatewayTopic");
const {
  GetListStaffInDepartment,
  GetListAllAdministrators,
  GetAllUserFromProject,
} = require("../services/grpcClient.services");
const UserNotificationService = require("../services/user_notification.service");
const { runProducer } = require("./producer");

const kafka = new Kafka({
  clientId: "notification-services",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "notification-continuous-group" });

const continuousConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topics: convertObjectToArray(departmentTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(projectTopicsContinuous),
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      try {
        const parsedMessage = JSON.parse(message.value.toString());
        console.log(
          `Received message from topic: ${topic}, partition: ${partition}`
        );
        console.log("Message content:", parsedMessage);
        switch (topic) {
          case departmentTopicsContinuous.updateDepartment: {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.modifiedBy
              );

              if (notification) {
                // Lấy danh sách nhân viên và quản trị viên
                const [user_ids, admin_ids] = await Promise.all([
                  GetListStaffInDepartment(parsedMessage.department_id),
                  GetListAllAdministrators(),
                ]);

                // Kết hợp và loại bỏ các ID trùng lặp
                const unique_list_user_ids = [
                  ...new Set([...user_ids, ...admin_ids]),
                ];

                // Lưu tất cả thông báo vào cơ sở dữ liệu cho từng userId
                await Promise.all(
                  unique_list_user_ids.map((userId) =>
                    UserNotificationService.create(
                      userId,
                      notification.notification_id
                    )
                  )
                );

                // Gửi tin nhắn thông báo đến Kafka
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification.content,
                  user_list: unique_list_user_ids,
                });
              }
            } catch (error) {
              console.error(
                `[Kafka] Error processing updateDepartment message:`,
                error.message
              );
              console.error(error.stack);
            }
            break;
          }
          case projectTopicsContinuous.updateProject: {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.modifiedBy
              );

              if (notification) {
                // Lấy danh sách nhân viên và quản trị viên
                const [user_ids, admin_ids] = await Promise.all([
                  GetAllUserFromProject(parsedMessage.project_id),
                  GetListAllAdministrators(),
                ]);

                // Kết hợp và loại bỏ các ID trùng lặp
                const unique_list_user_ids = [
                  ...new Set([...user_ids, ...admin_ids]),
                ];

                // Lưu tất cả thông báo vào cơ sở dữ liệu cho từng userId
                await Promise.all(
                  unique_list_user_ids.map((userId) =>
                    UserNotificationService.create(
                      userId,
                      notification.notification_id
                    )
                  )
                );

                // Gửi tin nhắn thông báo đến Kafka
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification.content,
                  user_list: unique_list_user_ids,
                });
              }
            } catch (error) {
              console.error(
                `[Kafka] Error processing updateProject message:`,
                error.message
              );
              console.error(error.stack);
            }
            break;
          }
          case (projectTopicsContinuous.deleteProject,
          projectTopicsContinuous.restoreProject): {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.modifiedBy
              );

              if (notification) {
                // Lấy danh sách nhân viên trong prj, dept và quản trị viên
                const [user_ids_in_project, user_ids_in_department, admin_ids] =
                  await Promise.all([
                    GetAllUserFromProject(parsedMessage.project_id),
                    Promise.all(
                      parsedMessage.department_ids.map((department_id) =>
                        GetListStaffInDepartment(department_id)
                      )
                    ).then((results) => results.flat()),
                    GetListAllAdministrators(),
                  ]);
                // Kết hợp và loại bỏ các ID trùng lặp
                const unique_list_user_ids = [
                  ...new Set([
                    ...user_ids_in_project,
                    ...user_ids_in_department,
                    ...admin_ids,
                  ]),
                ];

                // Lưu tất cả thông báo vào cơ sở dữ liệu cho từng userId
                await Promise.all(
                  unique_list_user_ids.map((userId) =>
                    UserNotificationService.create(
                      userId,
                      notification.notification_id
                    )
                  )
                );

                // Gửi tin nhắn thông báo đến Kafka
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification.content,
                  user_list: unique_list_user_ids,
                });
              }
            } catch (error) {
              console.error(
                `[Kafka] Error processing updateProject message:`,
                error.message
              );
              console.error(error.stack);
            }
            break;
          }
          case projectTopicsContinuous.createProject: {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.createdBy
              );

              if (notification) {
                // Lấy danh sách nhân viên từ các department và admin
                const [user_ids, admin_ids] = await Promise.all([
                  Promise.all(
                    parsedMessage.department_ids.map((department_id) =>
                      GetListStaffInDepartment(department_id)
                    )
                  ).then((results) => results.flat()), // Gộp các mảng thành một mảng phẳng
                  GetListAllAdministrators(),
                ]);

                // Kết hợp và loại bỏ các ID trùng lặp
                const unique_list_user_ids = [
                  ...new Set([...user_ids, ...admin_ids]),
                ];

                // Lưu tất cả thông báo vào cơ sở dữ liệu cho từng userId
                await Promise.all(
                  unique_list_user_ids.map((userId) =>
                    UserNotificationService.create(
                      userId,
                      notification.notification_id
                    )
                  )
                );

                // Gửi tin nhắn thông báo đến Kafka
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification.content,
                  user_list: unique_list_user_ids,
                });
              }
            } catch (error) {
              console.error(
                `[Kafka] Error processing createProject message:`,
                error.message
              );
              console.error(error.stack);
            }
            break;
          }
          case projectTopicsContinuous.removeProjectsFromDepartment: {
            try {
              await Promise.all(
                parsedMessage.project_ids.map(async (prj) => {
                  const message = `Project ${prj.name} has been removed from department ${parsedMessage.department_name}`;
                  const notification = await NotificationService.create(
                    message,
                    null
                  );
                  const [user_ids, admin_ids] = await Promise.all([
                    GetAllUserFromProject(prj.project_id),
                    GetListAllAdministrators(),
                  ]);
                  // Kết hợp và loại bỏ các ID trùng lặp
                  const unique_list_user_ids = [
                    ...new Set([...user_ids, ...admin_ids]),
                  ];
                  // Lưu tất cả thông báo vào cơ sở dữ liệu cho từng userId
                  await Promise.all(
                    unique_list_user_ids.map((userId) =>
                      UserNotificationService.create(
                        userId,
                        notification.notification_id
                      )
                    )
                  );
                  // Gửi tin nhắn thông báo đến Kafka
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification.content,
                    user_list: unique_list_user_ids,
                  });
                })
              );
            } catch (error) {
              console.error(
                `[Kafka] Error processing removeProjectsFromDepartment message:`,
                error.message
              );
              console.error(error.stack);
            }
            break;
          }
          default:
            console.log("Unhandled topic:", topic);
        }
        await heartbeat();
      } catch (err) {
        console.error("Error handling message:", err);
      }
    },
  });
};

module.exports = { continuousConsumer };
