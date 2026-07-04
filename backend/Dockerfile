FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN rm -f package-lock.json
RUN npm install

# Copy all other source code
COPY . .

# Generate Prisma Client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
