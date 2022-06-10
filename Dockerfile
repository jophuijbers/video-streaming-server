FROM node:16-alpine

WORKDIR /usr/src/app
COPY package*.json ./

# download dependencies
RUN npm install

COPY . .

CMD ["npm", "start"]