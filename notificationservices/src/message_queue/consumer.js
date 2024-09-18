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
const {
  userProducerTopic,
  userTopicsContinuous,
} = require("../configs/kafkaUserTopic");

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
  await consumer.subscribe({
    topics: convertObjectToArray(userTopicsContinuous),
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
          case departmentTopicsContinuous.createDepartment: {
            try {
              // Tạo thông báo cho quản trị viên và người dùng song song
              const [notification_admin, notification_user] = await Promise.all(
                [
                  NotificationService.create(
                    parsedMessage.message_admin,
                    parsedMessage.modifiedBy
                  ),
                  NotificationService.create(
                    parsedMessage.message_user,
                    parsedMessage.modifiedBy
                  ),
                ]
              );

              if (notification_admin) {
                // Lấy danh sách quản trị viên và lưu thông báo vào cơ sở dữ liệu
                const admin_ids = await GetListAllAdministrators();

                await Promise.all(
                  admin_ids.map((userId) =>
                    UserNotificationService.create(
                      userId,
                      notification_admin.notification_id
                    )
                  )
                );

                // Gửi tin nhắn thông báo đến Kafka
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification_admin.content,
                  noti_id: notification_admin.notification_id,
                  user_list: parsedMessage.admin_ids,
                });
              }

              if (notification_user) {
                // Lưu thông báo cho người dùng vào cơ sở dữ liệu
                await Promise.all(
                  parsedMessage.list_user_ids.map((userId) =>
                    UserNotificationService.create(
                      userId,
                      notification_user.notification_id
                    )
                  )
                );

                // Gửi tin nhắn thông báo đến Kafka
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification_user.content,
                  noti_id: notification_user.notification_id,
                  user_list: parsedMessage.list_user_ids,
                });
              }
            } catch (error) {
              console.error(
                `[Kafka] Error processing createDepartment message:`,
                error.message
              );
              console.error(error.stack);
            }
            break;
          }
          case (departmentTopicsContinuous.updateDepartment,
          departmentTopicsContinuous.deleteDepartment,
          departmentTopicsContinuous.restoreDepartment): {
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
                  noti_id: notification.notification_id,
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
                  noti_id: notification.notification_id,
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
                  noti_id: notification.notification_id,
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
                  noti_id: notification.notification_id,
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
                  if (notification) {
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
                      noti_id: notification.notification_id,
                      user_list: unique_list_user_ids,
                    });
                  }
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
          case userTopicsContinuous.removeManager:
          case userTopicsContinuous.addManager: {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.modifiedBy
              );

              // Kiểm tra nếu thông báo được tạo thành công
              if (notification) {
                // Chạy song song để tối ưu hóa thời gian
                await Promise.all([
                  // Lưu thông báo cho từng user_id
                  UserNotificationService.create(
                    parsedMessage.user_id,
                    notification.notification_id
                  ),
                  // Gửi thông báo tới Kafka
                  runProducer(gatewayProducerTopic.newNoti, {
                    content: notification.content,
                    noti_id: notification.notification_id,
                    user_list: [parsedMessage.user_id],
                  }),
                ]);
              } else {
                console.error("Failed to create notification");
              }
            } catch (error) {
              console.error(
                `[Error] Failed to process manager update: ${error.message}`
              );
            }
            break;
          }
          case (userTopicsContinuous.notiForAddStaffIntoDepartment,
          userProducerTopic.notiForRemoveStaffFromDepartment): {
            try {
              const { user_list, message, createdBy } = parsedMessage;

              // Tạo thông báo
              const notification = await NotificationService.create(
                message,
                createdBy
              );

              if (notification) {
                // Tạo các promise cho việc lưu thông báo và gửi tin nhắn Kafka
                const userNotificationsPromise = Promise.all(
                  user_list.map((userId) =>
                    UserNotificationService.create(
                      userId,
                      notification.notification_id
                    )
                  )
                );

                const kafkaNotificationPromise = runProducer(
                  gatewayProducerTopic.newNoti,
                  {
                    content: notification.content,
                    noti_id: notification.notification_id,
                    user_list,
                  }
                );

                // Chờ cho cả hai tác vụ hoàn tất
                await Promise.all([
                  userNotificationsPromise,
                  kafkaNotificationPromise,
                ]);
              }
            } catch (error) {
              console.error(
                `[Kafka] Error processing notification message:`,
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
