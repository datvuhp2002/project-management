"use strict";
const taskTopicsOnDemand = {};
const taskTopicsContinuous = {
  taskCreated: "task-created",
  taskUpdated: "task-updated",
  taskDeleted: "task-deleted",
  taskDeletedMultiple: "task-deleted-multiple",
};

module.exports = { taskTopicsOnDemand, taskTopicsContinuous };
