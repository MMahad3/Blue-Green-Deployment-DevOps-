FROM node:18

WORKDIR /app

# Copy package files from FE directory
COPY FE/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code from FE directory
COPY FE/ .

# Build the application
RUN npm run build

# Expose port for frontend
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 