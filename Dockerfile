FROM alpine:3.7

# install nodejs and git
RUN apk add --update nodejs; \
    apk add --update git

WORKDIR /statg

# install bot dependencies
COPY package.json package.json
RUN npm install

# copy bot files 
COPY . .

# make directories for volumes
RUN mkdir data
RUN mkdir logs

# TODO check if necessary and what VOLUME command really does
VOLUME /data
VOLUME /logs

ENTRYPOINT ["node", "./src/bot.js"]