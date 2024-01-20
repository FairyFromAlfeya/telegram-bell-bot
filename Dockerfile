FROM node:20.11.0-buster

WORKDIR /app

# Sources
COPY src /app/src

# Install
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

# Config
COPY tsconfig.json /app/tsconfig.json

# Build
RUN yarn
RUN yarn build

# Clean
RUN rm -rf /app/yarn.lock
RUN rm -rf /app/tsconfig.json
RUN rm -rf /app/src

CMD yarn prod
