# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the port
EXPOSE 3000

RUN npm run build
# Start the app
CMD ["npm", "run", "start"]