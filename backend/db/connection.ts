/// <reference types="node" />
import * as mysql from 'mysql2';
import dotenv from 'dotenv-safe';

dotenv.config();

const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_ROOT_PASSWORD', 'MYSQL_DATABASE'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}); 

const host = process.env.DB_HOST || process.env.MYSQL_HOST;

const pool = mysql.createPool({
  host,
  user: process.env.DB_USER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


export default pool;