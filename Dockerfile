FROM node:24-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate
RUN yarn build
RUN yarn install --frozen-lockfile --production

FROM node:24-alpine AS run

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

USER node

EXPOSE 4000

CMD ["sh", "-c", "yarn run start:migrate:prod"]
