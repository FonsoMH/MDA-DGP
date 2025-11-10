FROM node:20-alpine AS development

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install
