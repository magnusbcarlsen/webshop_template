// // backend/routes/products.ts
// import express, { Request, Response } from 'express';
// import { getConnection } from '../../../backend/db/connection.ts';

// const router = express.Router();

// // GET: /products - fetch all products
// router.get('/', async (req: Request, res: Response) => {
//   try {
//     const connection = await getConnection();
//     const [rows] = await connection.execute('SELECT * FROM products');
//     await connection.end();
//     res.json(rows);
//   } catch (error: unknown) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ error: (error instanceof Error) ? error.message : 'An unknown error occurred' });
//   }
// });

// // POST: /products - add a new product
// router.post('/', async (req: Request, res: Response) => {
//   try {
//     const { name, description, price } = req.body;
//     const connection = await getConnection();
//     const [result] = await connection.execute(
//       'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
//       [name, description, price]
//     );
//     await connection.end();
//     res.json({ success: true, result });
//   } catch (error: any) {
//     console.error('Error inserting product:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;