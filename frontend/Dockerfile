# Stage 1: Build the React app
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html
# Expose web port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
