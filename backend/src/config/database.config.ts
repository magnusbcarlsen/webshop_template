import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10) || 3306,
    username: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.ENVIRONMENT === 'development',
    logging: process.env.ENVIRONMENT === 'development',
  }),
);
