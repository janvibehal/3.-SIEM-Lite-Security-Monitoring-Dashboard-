# Use the official Node.js 24 LTS image
FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the backend source code
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the backend port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]