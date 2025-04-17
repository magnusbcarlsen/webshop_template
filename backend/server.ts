// backend/server.ts
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './db/connection';
import type { PoolConnection, RowDataPacket, QueryError } from 'mysql2';

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

app.get('/api/test-connection', (req: Request, res: Response) => {
  // Use NodeJS.ErrnoException here to match the pool.getConnection signature
  pool.getConnection(
    (err: NodeJS.ErrnoException | null, connection: PoolConnection) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return res
          .status(500)
          .json({ error: 'Database connection failed', details: err.message });
      }

      // For the actual SQL query you can still use the MySQL-specific QueryError
      connection.query<RowDataPacket[]>(
        'SELECT 1 + 1 AS solution',
        (err: QueryError | null, results) => {
          connection.release();

          if (err) {
            console.error('Error executing query:', err);
            return res
              .status(500)
              .json({ error: 'Query execution failed', details: err.message });
          }

          res.json({
            success: true,
            message: 'Database connection successful',
            results: results[0].solution,
          });
        }
      );
    }
  );
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Backend API is running');
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
