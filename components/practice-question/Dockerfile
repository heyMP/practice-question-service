FROM node:12

WORKDIR /home/node/app

COPY package.json package.json
RUN yarn install

COPY . .

EXPOSE 8000
CMD [ "yarn", "start" ]
