FROM node:boron

MAINTAINER Reekoh

COPY . /home/node/place-holder

WORKDIR /home/node/place-holder

# Install dependencies
RUN npm install pm2@2.6.1 -g

CMD pm2-docker --json app.yml
