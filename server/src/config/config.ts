// filepath: /social-network-server/social-network-server/src/config/config.ts

import dotenv from 'dotenv';

dotenv.config();

const config = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'storm0704',
    database: process.env.DB_NAME || 'flicker_social',
  },
};

export default config;