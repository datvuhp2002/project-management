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

# Expose the port the app runs on
EXPOSE 3050

# Command to run the app
CMD ["npm", "start"]
