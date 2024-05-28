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

ENV DATABASE_URL="mongodb+srv://lachongtechintern:hNX6k0uzO4pDphtM@cluster0.vluhdw4.mongodb.net/taskService?retryWrites=true&w=majority&appName=Cluster0"
ENV CLOUDINARY_API_SECRET = Ec2Fdj1v2voufkhhkX-CkhOZnj8
# Expose the port the app runs on
EXPOSE 3060

# Command to run the app
CMD ["npm", "start"]