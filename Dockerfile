FROM node:16.7.0-alpine3.14

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

RUN npm run webpack:build:prod

FROM node:16.7.0-alpine3.14

ENTRYPOINT ["node", "main.js"]

WORKDIR /app

COPY --from=0 /app/dist/main.js .
