
FROM node:8.6

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app

ENV NODE_ENV=development

RUN npm install

EXPOSE 80

CMD [ "node", "server" ]