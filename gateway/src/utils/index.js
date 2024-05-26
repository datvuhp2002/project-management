"use strict";
const _ = require("lodash");
const axios = require("axios");
const { BadRequestError } = require("../core/error.response");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getAllActivitiesForTask = async (task_property_id) => {
  try {
    const response = await axios.get(
      `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesByYear/${task_property_id}?items_per_page="ALL"`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching activities for task:", error);
    throw new BadRequestError("Failed to fetch activities for task");
  }
};

const addActivitiesToTasks = async (tasks) => {
  try {
    const tasksWithActivities = await Promise.all(
      tasks.map(async (task) => {
        const activities = await getAllActivitiesForTask(
          task.TaskProperty.task_property_id
        );
        return { ...task, activities };
      })
    );
    return tasksWithActivities;
  } catch (error) {
    console.error("Error adding activities to tasks:", error);
    throw new BadRequestError("Failed to add activities to tasks");
  }
};

const getAllProjectInDepartment = async (department_id) => {
  try {
    const response = await axios.get(
      `${process.env.PROJECT_SERVICES_REQUEST_URL}/getAllProjectInDepartment/${department_id}?items_per_page="ALL"`,
      { responseType: "json" }
    );
    if (!response.data) {
      throw new BadRequestError("Người dùng không tồn tại");
    }
    return response.data.data.data;
  } catch (error) {
    console.error("Error fetching projects in department:", error);
    throw new BadRequestError("Failed to fetch projects in department");
  }
};

const getAllTasksPropertyForProject = async (project_property_id) => {
  try {
    const taskPropertyResponse = await axios.get(
      `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllTaskPropertyFromProject/${project_property_id}?items_per_page="ALL"`
    );
    const taskProperties = taskPropertyResponse.data.data;
    const listTask = await getListTaskByTaskProperty(taskProperties);

    return listTask;
  } catch (error) {
    console.error("Error fetching task properties for project:", error);
    throw new BadRequestError("Failed to fetch task properties for project");
  }
};

const getListTaskByTaskProperty = async (task_property_ids) => {
  console.log(task_property_ids);
  try {
    const listTaskResponse = await axios.post(
      `${process.env.TASK_SERVICES_REQUEST_URL}/getAllTaskByTaskProperty`,
      { task_property_ids }
    );
    const listTasks = listTaskResponse.data.data.data;
    return listTasks;
  } catch (error) {
    console.error("Error fetching tasks for task properties:", error);
    throw new BadRequestError("Failed to fetch tasks for task properties");
  }
};

const addTasksToProjects = async (projects) => {
  try {
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const tasks = await getAllTasksPropertyForProject(
          project.ProjectProperty.project_property_id
        );
        const taskWithActivities = await addActivitiesToTasks(tasks);
        return { ...project, tasks: taskWithActivities };
      })
    );
    return projectsWithTasks;
  } catch (error) {
    console.error("Error adding tasks to projects:", error);
    throw new BadRequestError("Failed to add tasks to projects");
  }
};

const getUserByEmail = async (email) => {
  try {
    const response = await axios.get(
      `${process.env.REQUEST_URL}/users/findByEmail/${email}`,
      { responseType: "json" }
    );
    if (!response.data) {
      throw new BadRequestError("Người dùng không tồn tại");
    }
    const foundUser = response.data.data;
    const role = response.data.data.UserProperty.role;
    return { user: foundUser, role };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new BadRequestError("Failed to fetch user by email");
  }
};

module.exports = {
  getInfoData,
  getUserByEmail,
  getAllProjectInDepartment,
  getAllTasksPropertyForProject,
  addTasksToProjects,
};
