# Build node app in full node container
FROM node:8

# install/build node modules, with full c build chain
WORKDIR /build
RUN npm install -g yarn
COPY package.json yarn.lock ./
RUN yarn install

# distribute much smaller alpine image
FROM node:8-alpine
WORKDIR /app
VOLUME /app/data
COPY --from=0 /build .
COPY . .
ENTRYPOINT ["yarn", "start"]
