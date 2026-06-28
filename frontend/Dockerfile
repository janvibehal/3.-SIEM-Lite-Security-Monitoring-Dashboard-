# Use the official Node.js 24 image
FROM node:24-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]