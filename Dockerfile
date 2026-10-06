FROM node:20-alpine

WORKDIR /app

# Install build tools for native packages like bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install


COPY . .

EXPOSE 3000

CMD ["npm", "start"]
