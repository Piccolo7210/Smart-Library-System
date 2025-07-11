FROM node:20-alpine

COPY package*.json /app/

COPY . /app/

WORKDIR /app

RUN npm install

EXPOSE 3003

CMD ["npm", "run", "dev"]