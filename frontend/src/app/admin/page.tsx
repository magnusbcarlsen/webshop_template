"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { fetchProducts, createProduct, ProductAPI } from "@/services/api";

// Minimal form shape for creating a product
interface NewProductForm {
  name: string;
  slug: string;
  description?: string;
  price: number;
  stockQuantity: number;
}

export default function AdminPage() {
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NewProductForm>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    stockQuantity: 0,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    let v: any = value;
    if (type === "number") v = parseFloat(value);
    setForm((f) => ({ ...f, [name]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createProduct({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: form.price,
        salePrice: null,
        stockQuantity: form.stockQuantity,
        sku: null,
        weight: null,
        dimensions: null,
        isFeatured: false,
        isActive: true,
        categoryId: null,
      });
      setForm({
        name: "",
        slug: "",
        description: "",
        price: 0,
        stockQuantity: 0,
      });
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to create product");
    }
  }

  if (loading) return <p>Loading products…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Product Admin</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-2"
          />
        </div>
        <div>
          <label className="block">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="w-full border p-2"
          />
        </div>
        <div>
          <label className="block">Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            step="0.01"
            required
            className="w-full border p-2"
          />
        </div>
        <div>
          <label className="block">Stock Quantity</label>
          <input
            type="number"
            name="stockQuantity"
            value={form.stockQuantity}
            onChange={handleChange}
            className="w-full border p-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Product
        </button>
      </form>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Slug</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.slug}</td>
              <td className="border p-2">{p.price}</td>
              <td className="border p-2">{p.stockQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
