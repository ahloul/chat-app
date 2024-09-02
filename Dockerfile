FROM node:20.12.2

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .


CMD [ "yarn", "run", "start:dev" ]