FROM node:24-alpine

WORKDIR /app

ARG ENV
ARG PORT
ARG RPC_URL
ARG PROGRAM_ID
ARG MASTER_WALLET_PRIVATE_KEY
ARG DATABASE_URL

# Copy application files
COPY . /app

# Install dependencies
RUN yarn install --frozen-lockfile

# Build the application
RUN yarn build

# Expose the application port
EXPOSE 4000

ENV ENV=prod
ENV RPC_URL=${RPC_URL}
ENV PROGRAM_ID=${PROGRAM_ID}
ENV MASTER_WALLET_PRIVATE_KEY=${MASTER_WALLET_PRIVATE_KEY}
ENV DATABASE_URL=${DATABASE_URL}
ENV PORT=4000

# Start the application
ENTRYPOINT ["yarn", "start:prod"]
