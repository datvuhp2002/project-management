"use strict";
const _ = require("lodash");
const axios = require("axios");
const { BadRequestError } = require("../core/error.response");

const convertObjectToArray = (obj) => {
  return Object.keys(obj).map((key) => obj[key]);
};
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getAllUsersForActivity = async (user_ids) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffByUserIds?items_per_page=ALL`,
      { user_ids }
    );
    return response.data.data.users;
  } catch (error) {
    console.error(
      "Error fetching user information for activities:",
      error.message
    );
    throw new BadRequestError(
      "Failed to fetch user information for activities"
    );
  }
};

const getAllActivitiesForTask = async (task_id) => {
  try {
    const response = await axios.get(
      `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesByYear/${task_id}?items_per_page=ALL`
    );
    let activities = response.data.data;
    try {
      // Lấy danh sách user_id và lọc trùng
      const user_ids = [
        ...new Set(
          Object.values(activities).flatMap((dateActivities) =>
            dateActivities.map((activity) => activity.createdBy)
          )
        ),
      ];
      console.log("user_ids:", user_ids);
      // Lấy thông tin người dùng dựa trên user_ids
      const userInformation = await getAllUsersForActivity(user_ids);
      console.log("userInformation:", userInformation);
      // Gắn thông tin người dùng vào mỗi hoạt động
      for (const dateActivities of Object.values(activities)) {
        for (const activity of dateActivities) {
          const correspondingUser = userInformation.find(
            (user) => user.user_id === activity.createdBy
          );
          activity.user_information = correspondingUser;
        }
      }
    } catch (err) {
      console.log(err.message);
    }

    console.log("Activities with user information:", activities);
    return activities;
  } catch (error) {
    console.error("Error fetching activities for task:", error);
    throw new BadRequestError("Failed to fetch activities for task");
  }
};

const addActivitiesToTasks = async (tasks) => {
  try {
    const tasksWithActivities = await Promise.all(
      tasks.map(async (task) => {
        const activities = await getAllActivitiesForTask(task.task_id);
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
      throw new BadRequestError("Dự án không tồn tại");
    }
    console.log(response.data.data);
    return response.data.data.data;
  } catch (error) {
    console.error("Error fetching projects in department:", error);
    throw new BadRequestError("Failed to fetch projects in department");
  }
};

const getAllTasksForProject = async (project_id) => {
  try {
    const taskPropertyResponse = await axios.get(
      `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllTaskFromProject/${project_id}?items_per_page="ALL"`
    );
    const taskIds = taskPropertyResponse.data.data;
    const listTask = await getListTaskByTaskIds(taskIds);
    return listTask;
  } catch (error) {
    console.error("Error fetching task properties for project:", error);
    throw new BadRequestError("Failed to fetch task properties for project");
  }
};

const getListTaskByTaskIds = async (task_ids) => {
  try {
    const listTaskResponse = await axios.post(
      `${process.env.TASK_SERVICES_REQUEST_URL}/getAllTaskByTaskIds`,
      { task_ids }
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
        const tasks = await getAllTasksForProject(project.project_id);
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
const addTasksToProject = async (project) => {
  try {
    const tasks = await getAllTasksForProject(project.project_id);
    const taskWithActivities = await addActivitiesToTasks(tasks);
    return { ...project, tasks: taskWithActivities };
  } catch (error) {
    console.error("Error adding tasks to projects:", error);
    throw new BadRequestError("Failed to add tasks to projects");
  }
};
const detailProject = async (project_id) => {
  try {
    const projectInformation = await axios.get(
      `${process.env.PROJECT_SERVICES_REQUEST_URL}/detail/${project_id}`
    );
    return projectInformation;
  } catch (error) {
    throw new BadRequestError("Failed to get project information");
  }
};
const getUserByEmail = async (email) => {
  try {
    const response = await axios.get(
      `${process.env.REQUEST_URL}/users/find-by-email/${email}`,
      { responseType: "json" }
    );
    if (!response.data) {
      throw new BadRequestError("Người dùng không tồn tại");
    }
    const foundUser = response.data.data;
    const role = foundUser.role;
    return { user: foundUser, role };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new BadRequestError("Failed to fetch user by email");
  }
};
const getUserByUsername = async (username) => {
  try {
    const response = await axios.get(
      `${process.env.REQUEST_URL}/users/find-by-username/${username}`,
      { responseType: "json" }
    );
    if (!response.data) {
      throw new BadRequestError("Người dùng không tồn tại");
    }
    const foundUser = response.data.data;
    const role = foundUser.role;
    return { user: foundUser, role };
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw new BadRequestError("Failed to fetch user by username");
  }
};

module.exports = {
  getInfoData,
  getUserByEmail,
  getUserByUsername,
  getAllProjectInDepartment,
  getAllTasksForProject,
  addTasksToProjects,
  detailProject,
  addTasksToProject,
  convertObjectToArray,
};
