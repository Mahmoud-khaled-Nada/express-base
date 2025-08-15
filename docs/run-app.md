# Init
npm init -y

# Core
npm i express cors helmet hpp compression morgan express-rate-limit zod
npm i dotenv
npm i --save-dev @types/compression

# Errors / logging / metrics
npm i pino pino-pretty
npm i prom-client

# DBs
npm i mongoose
npm i @prisma/client
npm i ioredis
npm i amqplib kafkajs

npm i --save-dev @types/amqplib

# Dev
npm i -D typescript ts-node-dev @types/node @types/express @types/cors @types/hpp @types/morgan
npm i -D prisma eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Swagger (optional but handy)
npm i swagger-ui-express zod-to-openapi



<!-- Run it -->

# start infra
docker-compose up -d

# seed env
cp .env.example .env

# prisma
npx prisma generate
npx prisma migrate dev --name init

# dev server
npm run dev
