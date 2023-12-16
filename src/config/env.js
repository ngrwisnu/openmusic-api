const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  pg: {
    pgHost: process.env.PGHOST,
    pgPort: process.env.PGPORT,
    pgUser: process.env.PGUSER,
    pgDatabase: process.env.PGDATABASE,
    pgPassword: process.env.PGPASSWORD,
  },
  tk: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
  redis: {
    redisServer: process.env.REDIS_SERVER,
  },
  rabbitMq: {
    rabbitmqServer: process.env.RABBITMQ_SERVER,
  },
};

export default config;
