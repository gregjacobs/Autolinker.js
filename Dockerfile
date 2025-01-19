FROM starefossen/ruby-node:alpine

RUN apk --update add build-base \
 && gem install -N jsduck \
 && npm i -g bower gulp

WORKDIR /app
COPY . /app

RUN npm i

ENTRYPOINT sh
