// backend/server.ts
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './db/connection';
import type { PoolConnection, RowDataPacket, QueryError } from 'mysql2';

interface ProductRow extends RowDataPacket {
  product_id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
}

interface ImageRow extends RowDataPacket {
  image_id: number;
  product_id: number;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

interface VariantRow extends RowDataPacket {
  variant_id: number;
  product_id: number;
  variant_name: string;
  variant_value: string;
}


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

// Get all products
app.get('/api/products', (req: Request, res: Response) => {
  pool.query(
    'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id',
    (err, results) => {
      if (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'Failed to fetch products' });
      }
      res.json(results);
    }
  );
});


app.get<{ id: string }>(
  '/api/products/:id',
  async (req, res) => {
    const productId = Number(req.params.id);
    if (Number.isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    try {
      const [products] = await pool
        .promise()
        .query<ProductRow[]>(
          `SELECT 
             p.*, 
             c.name AS category_name 
           FROM products p
           LEFT JOIN categories c
             ON p.category_id = c.category_id
           WHERE p.product_id = ?`,
          [productId]
        );

      if (products.length === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      const product = products[0] as any;

      const [images] = await pool
        .promise()
        .query<ImageRow[]>(
          `SELECT * 
           FROM product_images 
           WHERE product_id = ?
           ORDER BY is_primary DESC, sort_order ASC`,
          [productId]
        );

      const [variants] = await pool
        .promise()
        .query<VariantRow[]>(
          `SELECT * 
           FROM product_variants 
           WHERE product_id = ?`,
          [productId]
        );

      product.images = images;
      product.variants = variants;

      res.json(product);
      return;
    } catch (err: any) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error', details: err.message });
      return;
    }
  }
);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});


// app.get('/', (_req: Request, res: Response) => {
//   res.send('Backend API is running');
// });

