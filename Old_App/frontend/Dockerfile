FROM node:18

WORKDIR /app

# Copy package files
COPY FE/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY FE/ .

# Build the application
RUN npm run build

# Expose port for frontend
EXPOSE 3000

# Start the application
CMD ["npm","run", "start"] 
