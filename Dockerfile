FROM node:11.15.0-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY back-end ./back-end
COPY front-end ./front-end
COPY tsconfig*.json ./
COPY tslint*.json ./
COPY *.env ./

CMD ["node", "back-end/build/bin/www.js"]

EXPOSE 5000
