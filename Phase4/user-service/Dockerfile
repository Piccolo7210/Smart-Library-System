FROM node:20-alpine

COPY package*.json /app/

COPY . /app/

WORKDIR /app

RUN npm install

EXPOSE 3001
CMD ["npm", "run", "dev"]