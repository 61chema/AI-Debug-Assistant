FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the React app into static files (dist/ folder)
RUN npm run build

# Install a lightweight static file server
RUN npm install -g serve

EXPOSE 3000

# Serve the built files
CMD ["serve", "-s", "dist", "-l", "3000"]
