# Use an official Node.js runtime as a parent image
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

RUN npx prisma generate
# RUN npx prisma db push
# Expose the port the app runs on
EXPOSE 3061

# Command to run the app
CMD ["npm", "start"]
