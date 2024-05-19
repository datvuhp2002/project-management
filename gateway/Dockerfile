# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Set environment variables
ENV PORT=3050
ENV REQUEST_URL="http://gateway:3050"
ENV USER_SERVICES_REQUEST_URL="http://userservices:3056/services/api/user"
ENV DEPARTMENT_SERVICES_REQUEST_URL="http://departmentservices:3057/services/api/department"
ENV ASSIGNMENT_SERVICES_REQUEST_URL="http://assignmentservices:3058/services/api/assignment"
ENV PROJECT_SERVICES_REQUEST_URL="http://projectservices:3059/services/api/project"
ENV CLIENT_REQUEST_URL="http://projectservices:3059/services/api/project/client"
ENV TASK_SERVICES_REQUEST_URL="http://taskservices:3060/services/api/task"
ENV ACTIVITY_SERVICES_REQUEST_URL="http://activityservices:3061/services/api/activity"

# Expose the port the app runs on
EXPOSE 3050

# Command to run the app
CMD ["npm", "start"]
