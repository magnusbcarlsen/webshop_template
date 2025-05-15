"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  fetchProducts,
  createProduct,
  ProductAPI,
  deleteProduct,
  updateProduct,
  fetchCategories,
  CategoryAPI,
  createCategory,
} from "@/services/product-api";
import { slugify } from "utils/slugify";

// Minimal form shape for creating a product
interface ProductForm {
  name: string;
  slug: string;
  description?: string;
  price: number;
  stockQuantity: number;
  categoryName?: string;
}

export default function AdminPage() {
  const initialForm: ProductForm = {
    name: "",
    slug: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    categoryName: "",
  };

  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [categories, setCategories] = useState<CategoryAPI[]>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
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

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  // handle input changes
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    let v: string | number = value;
    if (type === "number") v = parseFloat(value);
    setForm((f) => ({
      ...f,
      [name]: v,
      ...(name === "name"
        ? { slug: slugify(v.toString(), { lower: true }) }
        : {}),
    }));
  }

  function openCreateModal() {
    setError(null);
    setIsEditing(false);
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  }

  function openEditModal(p: ProductAPI) {
    setError(null);
    setIsEditing(true);
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      price: p.price,
      stockQuantity: p.stockQuantity,
      categoryName: p.category?.name ?? "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      // ── determine or create category based on form.categoryName ──
      let categoryId: number | null = null;
      if (form.categoryName) {
        const existing = categories.find((c) => c.name === form.categoryName);
        if (existing) {
          categoryId = existing.id;
        } else {
          const newCat = await createCategory({
            name: form.categoryName,
            slug: slugify(form.categoryName, { lower: true }),
          });
          setCategories([...categories, newCat]);
          categoryId = newCat.id;
        }
      }

      // build common payload
      const productData = {
        name: form.name,
        slug: form.slug,
        description: form.description ?? null,
        price: form.price,
        salePrice: null,
        stockQuantity: form.stockQuantity,
        sku: null,
        weight: null,
        dimensions: null,
        isFeatured: false,
        isActive: true,
        categoryId, // ← here’s the change
      };

      if (isEditing && editingId !== null) {
        await updateProduct(editingId, productData);
        setEditingId(null);
      } else {
        await createProduct(productData);
      }

      closeModal();
      await loadProducts();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : isEditing
          ? "Failed to edit product"
          : "Failed to create product";
      setError(errorMessage);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Are you sure you want to delete this product? This can not be undone"
      )
    )
      return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  }

  // if (loading) return <p>Loading products…</p>;
  // if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Product Admin</h1>

        <button onClick={openCreateModal} className="mb-6">
          Create new product
        </button>
        <h2>All your products</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Slug (URL)</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Category</th>
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
                <td className="border p-2">{p.category?.name || "-"}</td>
                <td className="border p-2">{p.stockQuantity}</td>

                <td className="border p-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal for creating/editing a product */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
            <div
              className={`bg-[var(--background)] rounded-lg p-6 w-full max-w-md transform transition-transform ease-in-out duration-300 origin-center ${
                isModalOpen ? "scale-100" : "scale-0"
              }`}
            >
              <h2 className="text-xl font-bold mb-4">
                {isEditing ? "Edit Product" : "Create Product"}
              </h2>
              {error && (
                <div className="mb-2 p-2 bg-red-100 text-red-800 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
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
                  <label className="block">Category</label>
                  <input
                    list="category-list"
                    name="categoryName"
                    value={form.categoryName}
                    onChange={handleChange}
                    className="w-full border p-2"
                  />
                  <datalist id="category-list">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
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
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {isEditing ? "Save Changes" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
