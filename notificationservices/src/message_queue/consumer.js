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
  GetUserAssignedToTask,
} = require("../services/grpcClient.services");
const UserNotificationService = require("../services/user_notification.service");
const { runProducer } = require("./producer");
const {
  userProducerTopic,
  userTopicsContinuous,
} = require("../configs/kafkaUserTopic");
const { taskTopicsContinuous } = require("../configs/kafkaTaskTopic");
const { activityTopicsContinuous } = require("../configs/kafkaActivityTopic");
const {
  assignmentTopicsContinuous,
} = require("../configs/kafkaAssignmentTopic");
const { GetTask } = require("../services/grpcClient.services");

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
  await consumer.subscribe({
    topics: convertObjectToArray(taskTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(assignmentTopicsContinuous),
    fromBeginning: false,
  });
  await consumer.subscribe({
    topics: convertObjectToArray(activityTopicsContinuous),
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
          case departmentTopicsContinuous.notiForCreateDepartment: {
            try {
              // Tạo thông báo cho quản trị viên và người dùng song song
              const [notification_admin, notification_user] = await Promise.all(
                [
                  NotificationService.create(
                    parsedMessage.message_admin,
                    parsedMessage.createdBy,
                    {
                      target_id: parsedMessage.target_id,
                      targetFor: parsedMessage.targetFor,
                      target_name: parsedMessage.target_name,
                    }
                  ),
                  NotificationService.create(
                    parsedMessage.message_user,
                    parsedMessage.createdBy,
                    {
                      target_id: parsedMessage.target_id,
                      targetFor: parsedMessage.targetFor,
                      target_name: parsedMessage.target_name,
                    }
                  ),
                ]
              );
              if (notification_admin) {
                // Lấy danh sách quản trị viên và lưu thông báo vào cơ sở dữ liệu
                const admin_ids = await GetListAllAdministrators();
                await UserNotificationService.createMany(
                  admin_ids.map((user_id) => ({
                    user_id,
                    notification_id: notification_admin.notification_id,
                  }))
                );
                // Gửi tin nhắn thông báo đến Kafka
                if (admin_ids.length > 0) {
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification_admin.content,
                    noti_id: notification_admin.notification_id,
                    user_list: admin_ids,
                    username: notification_admin.username,
                    target_name: parsedMessage.target_name,
                    target_id: notification_admin.target_id,
                    targetFor: parsedMessage.targetFor,
                  });
                }
              }
              if (notification_user && parsedMessage.list_user_ids.length > 0) {
                // Lưu thông báo cho người dùng vào cơ sở dữ liệu
                await UserNotificationService.createMany(
                  parsedMessage.list_user_ids.map((user_id) => ({
                    user_id,
                    notification_id: notification_user.notification_id,
                  }))
                );
                // Gửi tin nhắn thông báo đến Kafka
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification_user.content,
                  noti_id: notification_user.notification_id,
                  user_list: parsedMessage.list_user_ids,
                  username: notification_admin.username || null,
                  target_name: parsedMessage.target_name,
                  target_id: notification_user.target_id,
                  targetFor: parsedMessage.targetFor,
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
          case departmentTopicsContinuous.notiForUpdateDepartment:
          case departmentTopicsContinuous.notiFordeleteDepartment:
          case departmentTopicsContinuous.notiForRestoreDepartment: {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.modifiedBy,
                {
                  target_id: parsedMessage.department_id,
                  targetFor: parsedMessage.targetFor,
                  target_name: parsedMessage.department_name,
                }
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
                if (unique_list_user_ids.length > 0) {
                  await UserNotificationService.createMany(
                    unique_list_user_ids.map((user_id) => ({
                      user_id,
                      notification_id: notification.notification_id,
                    }))
                  );
                  // Gửi tin nhắn thông báo đến Kafka
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification.content,
                    noti_id: notification.notification_id,
                    user_list: unique_list_user_ids,
                    username: notification.username || null,
                    target_id: parsedMessage.department_id,
                    targetFor: parsedMessage.targetFor,
                    target_name: parsedMessage.department_name,
                  });
                }
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
          case projectTopicsContinuous.notiForUpdateProject: {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.modifiedBy,
                {
                  target_id: parsedMessage.project_id,
                  targetFor: parsedMessage.targetFor,
                  target_name: parsedMessage.target_name,
                }
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
                if (unique_list_user_ids.length > 0) {
                  // Lưu tất cả thông báo vào cơ sở dữ liệu cho từng userId
                  await UserNotificationService.createMany(
                    unique_list_user_ids.map((user_id) => ({
                      user_id,
                      notification_id: notification.notification_id,
                    }))
                  );

                  // Gửi tin nhắn thông báo đến Kafka
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification.content,
                    noti_id: notification.notification_id,
                    user_list: unique_list_user_ids,
                    username: notification.username || null,
                    target_id: parsedMessage.project_id,
                    targetFor: parsedMessage.targetFor,
                    target_name: parsedMessage.target_name,
                  });
                }
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
          case projectTopicsContinuous.notiForDeleteProject:
          case projectTopicsContinuous.notiForRestoreProject: {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.modifiedBy,
                {
                  target_id: parsedMessage.project_id,
                  targetFor: parsedMessage.targetFor,
                  target_name: parsedMessage.target_name,
                }
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
                if (unique_list_user_ids.length > 0) {
                  await UserNotificationService.createMany(
                    unique_list_user_ids.map((user_id) => ({
                      user_id,
                      notification_id: notification.notification_id,
                    }))
                  );

                  // Gửi tin nhắn thông báo đến Kafka
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification.content,
                    noti_id: notification.notification_id,
                    user_list: unique_list_user_ids,
                    username: notification.username || null,
                    target_id: parsedMessage.project_id,
                    targetFor: parsedMessage.targetFor,
                    target_name: parsedMessage.target_name,
                  });
                }
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
          case projectTopicsContinuous.notiForCreateProject: {
            try {
              // Tạo thông báo
              const notification = await NotificationService.create(
                parsedMessage.message,
                parsedMessage.createdBy,
                {
                  target_id: parsedMessage.target_id,
                  targetFor: parsedMessage.targetFor,
                  target_name: parsedMessage.target_name,
                }
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
                if (unique_list_user_ids.length > 0) {
                  await UserNotificationService.createMany(
                    unique_list_user_ids.map((user_id) => ({
                      user_id,
                      notification_id: notification.notification_id,
                    }))
                  );

                  // Gửi tin nhắn thông báo đến Kafka
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification.content,
                    noti_id: notification.notification_id,
                    user_list: unique_list_user_ids,
                    username: notification.username || null,
                    target_id: parsedMessage.target_id,
                    targetFor: parsedMessage.targetFor,
                    target_name: parsedMessage.target_name,
                  });
                }
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
          case projectTopicsContinuous.notiForRemoveProjectsFromDepartment: {
            try {
              await Promise.all(
                parsedMessage.project_ids.map(async (prj) => {
                  const message = `project has been removed from department ${parsedMessage.department_name}`;
                  const notification = await NotificationService.create(
                    message,
                    null,
                    {
                      target_id: prj.project_id,
                      targetFor: "PROJECT",
                      target_name: prj.name,
                    }
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
                    if (unique_list_user_ids.length > 0) {
                      await UserNotificationService.createMany(
                        unique_list_user_ids.map((user_id) => ({
                          user_id,
                          notification_id: notification.notification_id,
                        }))
                      );
                      // Gửi tin nhắn thông báo đến Kafka
                      await runProducer(gatewayProducerTopic.newNoti, {
                        content: notification.content,
                        noti_id: notification.notification_id,
                        user_list: unique_list_user_ids,
                        target_id: prj.project_id,
                        targetFor: "PROJECT",
                        target_name: prj.name,
                      });
                    }
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
          case userTopicsContinuous.notiForRemoveManager:
          case userTopicsContinuous.notiForAddManager: {
            try {
              // Create notification for the manager's action
              const notificationMessage = parsedMessage.message;
              const notification = await NotificationService.create(
                notificationMessage,
                parsedMessage.modifiedBy,
                {
                  target_name: parsedMessage.department_name,
                  targetFor: "USER",
                }
              );

              if (!notification) {
                console.error("Failed to create main notification");
                break;
              }

              // Create a user-specific notification for the manager
              const userMessage =
                topic === userTopicsContinuous.notiForRemoveManager
                  ? `You are removed from department`
                  : `You have become the manager of department`;

              const notificationForUser = await NotificationService.create(
                userMessage,
                null,
                {
                  target_name: parsedMessage.department_name,
                  targetFor: "USER",
                }
              );

              if (notificationForUser) {
                // Create the notification record for the specific user
                const userNotification = await UserNotificationService.create(
                  parsedMessage.user_id,
                  notificationForUser.notification_id
                );

                if (userNotification) {
                  // Send the notification to Kafka for the user
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notificationForUser.content,
                    noti_id: notificationForUser.notification_id,
                    user_list: [parsedMessage.user_id],
                    username: notification.username,
                    target_name: parsedMessage.department_name,
                    targetFor: "USER",
                  });
                } else {
                  console.error(
                    `Failed to create user notification for userId: ${parsedMessage.user_id}`
                  );
                }
              }

              // Fetch staff and admin lists in parallel
              const [staffIds, adminIds] = await Promise.all([
                Promise.all(
                  GetListStaffInDepartment(parsedMessage.department_id)
                ).then((results) => results.flat()),
                GetListAllAdministrators(),
              ]);

              // Merge and deduplicate user IDs
              const uniqueUserIds = [...new Set([...staffIds, ...adminIds])];

              // Create notifications for all users in parallel
              await Promise.all(
                uniqueUserIds.map((userId) =>
                  UserNotificationService.create(
                    userId,
                    notification.notification_id
                  )
                )
              );

              // Send notification to Kafka for all relevant users
              await runProducer(gatewayProducerTopic.newNoti, {
                content: notification.content,
                noti_id: notification.notification_id,
                user_list: uniqueUserIds,
              });
            } catch (error) {
              console.error(
                `[Error] Failed to process manager update: ${error.message}`,
                error
              );
            }
            break;
          }
          // chưa sửa noti
          case userTopicsContinuous.notiForAddStaffIntoDepartment:
          case userProducerTopic.notiForRemoveStaffFromDepartment: {
            try {
              const { user_list, message, createdBy } = parsedMessage;

              // Tạo thông báo
              const notification = await NotificationService.create(
                message,
                createdBy
              );

              if (notification && user_list.length > 0) {
                await UserNotificationService.createMany(
                  user_list.map((user_id) => ({
                    user_id,
                    notification_id: notification.notification_id,
                  }))
                );
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification.content,
                  noti_id: notification.notification_id,
                  user_list,
                });
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
          case userTopicsContinuous.notiForCreateUser: {
            try {
              const { message_admin, message_user, user_id, createdBy } =
                parsedMessage;

              // Tạo thông báo
              const notification_admin = await NotificationService.create(
                message_admin,
                createdBy
              );
              const notification_user = await NotificationService.create(
                message_user,
                null
              );
              if (notification_admin) {
                // Tạo các promise cho việc lưu thông báo và gửi tin nhắn Kafka
                // Lấy danh sách nhân viên từ các department và admin
                const admin_ids = await GetListAllAdministrators();

                // Kết hợp và loại bỏ các ID trùng lặp
                const unique_list_user_admin_ids = [...new Set([...admin_ids])];

                // Lưu tất cả thông báo vào cơ sở dữ liệu cho từng userId
                if (unique_list_user_admin_ids.length > 0) {
                  await UserNotificationService.createMany(
                    unique_list_user_admin_ids.map((user_id) => ({
                      user_id,
                      notification_id: notification_admin.notification_id,
                    }))
                  );
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification_admin.content,
                    noti_id: notification_admin.notification_id,
                    user_list,
                  });
                }
              }
              if (notification_user) {
                await UserNotificationService.create(
                  user_id,
                  notification_user.notification_id
                );
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
          case userTopicsContinuous.notiForUpdateUser: {
            try {
              const {
                message,
                user_id,
                modifiedBy: initialModifiedBy,
              } = parsedMessage;
              const modifiedBy =
                initialModifiedBy === user_id ? null : initialModifiedBy;
              // Tạo thông báo
              const notification = await NotificationService.create(
                message,
                modifiedBy
              );
              if (notification) {
                // Lưu tất cả thông báo vào cơ sở dữ liệu cho từng userId
                await UserNotificationService.create(
                  user_id,
                  notification.notification_id
                );
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification.content,
                  noti_id: notification.notification_id,
                  user_list: [user_id],
                });
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
          case taskTopicsContinuous.notiForDeleteTask: {
            try {
              const { message, modifiedBy, list_user_ids, user_id, task_name } =
                parsedMessage;
              // Tạo thông báo
              const notification_for_staff_in_project =
                await NotificationService.create(message, modifiedBy);
              if (notification_for_staff_in_project) {
                // Lưu tất cả thông báo cho tất cả mọi người trong phòng ban của task
                const adminIds = await GetListAllAdministrators();
                const uniqueUserIds = [
                  ...new Set([...list_user_ids, ...adminIds]),
                ];
                if (uniqueUserIds.length > 0) {
                  await UserNotificationService.createMany(
                    uniqueUserIds.map((user_id) => ({
                      user_id,
                      notification_id:
                        notification_for_staff_in_project.notification_id,
                    }))
                  );
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification_for_staff_in_project.content,
                    noti_id: notification_for_staff_in_project.notification_id,
                    user_list: uniqueUserIds,
                  });
                }
              }
              const notify_assigned_staff = await NotificationService.create(
                `The task ${task_name} you were assigned is deleted`,
                modifiedBy
              );
              if (notify_assigned_staff && user_id) {
                await UserNotificationService.create(
                  user_id,
                  notify_assigned_staff.notification_id
                );
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notify_assigned_staff.content,
                  noti_id: notify_assigned_staff.notification_id,
                  user_list: [user_id],
                });
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
          case assignmentTopicsContinuous.notifyAssignmentTaskForProject: {
            try {
              const { message, list_user_in_project, createdBy } =
                parsedMessage;
              // Tạo thông báo
              const notification_for_staff_in_project =
                await NotificationService.create(message, createdBy);
              if (notification_for_staff_in_project) {
                // Lưu tất cả thông báo cho tất cả mọi người trong phòng ban của task
                if (list_user_in_project.length > 0) {
                  await UserNotificationService.createMany(
                    list_user_in_project.map((user_id) => ({
                      user_id,
                      notification_id:
                        notification_for_staff_in_project.notification_id,
                    }))
                  );
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification_for_staff_in_project.content,
                    noti_id: notification_for_staff_in_project.notification_id,
                    user_list: list_user_in_project,
                  });
                }
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
          case assignmentTopicsContinuous.notifyRemoveStaffFromProject: {
            try {
              const { message, list_user_ids, modifiedBy } = parsedMessage;
              // Tạo thông báo
              const notification_for_staff = await NotificationService.create(
                message,
                modifiedBy
              );
              if (notification_for_staff) {
                // Lưu tất cả thông báo cho tất cả mọi người trong phòng ban của task
                if (list_user_ids.length > 0) {
                  await UserNotificationService.createMany(
                    list_user_ids.map((user_id) => ({
                      user_id,
                      notification_id: notification_for_staff.notification_id,
                    }))
                  );
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification_for_staff.content,
                    noti_id: notification_for_staff.notification_id,
                    user_list: list_user_in_project,
                  });
                }
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
          case assignmentTopicsContinuous.notifyAssignmentUserForProject: {
            try {
              const {
                message,
                user_id,
                list_user_in_project,
                project_name,
                createdBy,
              } = parsedMessage;
              // Tạo thông báo
              const notification_for_staff_in_project =
                await NotificationService.create(message, createdBy);
              if (notification_for_staff_in_project) {
                // Lưu tất cả thông báo cho tất cả mọi người trong phòng ban của task
                if (list_user_in_project.length > 0) {
                  await UserNotificationService.createMany(
                    list_user_in_project.map((user_id) => ({
                      user_id,
                      notification_id:
                        notification_for_staff_in_project.notification_id,
                    }))
                  );
                  await runProducer(gatewayProducerTopic.newNoti, {
                    content: notification_for_staff_in_project.content,
                    noti_id: notification_for_staff_in_project.notification_id,
                    user_list: list_user_in_project,
                  });
                }
              }
              const notify_assigned_staff = await NotificationService.create(
                `You are added to project ${project_name}`,
                createdBy
              );
              if (notify_assigned_staff && user_id) {
                await UserNotificationService.create(
                  user_id,
                  notify_assigned_staff.notification_id
                );
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notify_assigned_staff.content,
                  noti_id: notify_assigned_staff.notification_id,
                  user_list: [user_id],
                });
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
          case assignmentTopicsContinuous.notifyAssignmentUserForTask:
          case assignmentTopicsContinuous.notifyUnAssignmentUserForTask: {
            try {
              const { message, user_id, createdBy } = parsedMessage;
              // Tạo thông báo
              const notify_assigned_staff = await NotificationService.create(
                message,
                createdBy
              );
              if (notify_assigned_staff && user_id) {
                await UserNotificationService.create(
                  user_id,
                  notify_assigned_staff.notification_id
                );
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notify_assigned_staff.content,
                  noti_id: notify_assigned_staff.notification_id,
                  user_list: [user_id],
                });
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
          case activityTopicsContinuous.notiForCreateActivity: {
            const { task_id, createdBy } = parsedMessage;
            const task = await GetTask(task_id);
            const message = `A new activity is created in task ${task.name}`;
            const notification = await NotificationService.create(
              message,
              createdBy
            );
            if (notification) {
              const userAssignedToTask = await GetUserAssignedToTask(task_id);
              if (userAssignedToTask) {
                await UserNotificationService.create(
                  userAssignedToTask,
                  notification.notification_id
                );
                await runProducer(gatewayProducerTopic.newNoti, {
                  content: notification.content,
                  noti_id: notification.notification_id,
                  user_list: [userAssignedToTask],
                });
              }
            }
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
