# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 3000

# Start the backend
CMD ["npm", "start"]
