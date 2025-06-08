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
import { slugify } from "@/utils/slugify";

// Minimal form shape for creating a product
interface ProductForm {
  name: string;
  slug: string;
  description?: string;
  price: number;
  stockQuantity: number;
  selectedCategories: CategoryAPI[];
  categoryInput: string;
}

export default function AdminPage() {
  const initialForm: ProductForm = {
    name: "",
    slug: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    selectedCategories: [],
    categoryInput: "",
  };

  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [categories, setCategories] = useState<CategoryAPI[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data || []);
      setError(null);
    } catch {
      setError("Failed to load categories");
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    let v: string | number = value;
    if (type === "number") v = parseFloat(value) || 0;
    setForm((f) => ({
      ...f,
      [name]: v,
      ...(name === "name"
        ? { slug: slugify(v.toString(), { lower: true }) }
        : {}),
    }));
  }

  function handleCategoryInputChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, categoryInput: e.target.value }));
  }

  async function handleAddCategory() {
    const name = form.categoryInput.trim();
    if (!name) return;
    if (form.selectedCategories.some((c) => c.name === name)) {
      setForm((f) => ({ ...f, categoryInput: "" }));
      return;
    }
    const existing = categories.find((c) => c.name === name);
    if (existing) {
      setForm((f) => ({
        ...f,
        selectedCategories: [...f.selectedCategories, existing],
        categoryInput: "",
      }));
    } else {
      try {
        const created = await createCategory({
          name,
          slug: slugify(name, { lower: true }),
        });
        setCategories((cats) => [...cats, created]);
        setForm((f) => ({
          ...f,
          selectedCategories: [...f.selectedCategories, created],
          categoryInput: "",
        }));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to create category");
      }
    }
  }

  function handleRemoveCategory(id: number) {
    setForm((f) => ({
      ...f,
      selectedCategories: f.selectedCategories.filter((c) => c.id !== id),
    }));
  }

  function openCreateModal() {
    setError(null);
    setIsEditing(false);
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
    setFiles([]);
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
      selectedCategories: (p.categories as CategoryAPI[]) || [],
      categoryInput: "",
    });
    setFiles([]);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setFiles([]);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const productData = {
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
        categoryIds: form.selectedCategories.map((c) => c.id),
      };

      let payload: typeof productData | FormData = productData;

      if (files.length > 0) {
        const formData = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (key === "categoryIds") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });
        files.forEach((file) => formData.append("images", file));
        payload = formData;
      }

      if (isEditing && editingId !== null) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      closeModal();
      setTimeout(loadProducts, 100);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : isEditing
          ? "Failed to edit product"
          : "Failed to create product";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Are you sure you want to delete this product? This cannot be undone"
      )
    )
      return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch {
      setError("Failed to delete product");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-[var(--color-secondary)]">Loading products…</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Product Admin</h1>

        <button
          onClick={openCreateModal}
          className="mb-6 px-4 py-2 bg-[var(--color-primary)] text-[var(--foreground)] rounded hover:bg-[var(--color-accent)] transition-transform duration-200"
        >
          Create new product
        </button>

        <h2 className="text-xl font-semibold mb-4">
          All your products ({products.length})
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--color-secondary)]">
              No products found. Create your first product!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-[var(--color-secondary)]">
              <thead>
                <tr className="bg-[var(--background)]">
                  <th className="border border-[var(--color-secondary)] p-2">
                    ID
                  </th>
                  <th className="border border-[var(--color-secondary)] p-2">
                    Name
                  </th>
                  <th className="border border-[var(--color-secondary)] p-2">
                    Slug (URL)
                  </th>
                  <th className="border border-[var(--color-secondary)] p-2">
                    Price
                  </th>
                  <th className="border border-[var(--color-secondary)] p-2">
                    Category
                  </th>
                  <th className="border border-[var(--color-secondary)] p-2">
                    Stock
                  </th>
                  <th className="border border-[var(--color-secondary)] p-2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--background)]">
                    <td className="border border-[var(--color-secondary)] p-2">
                      {p.id}
                    </td>
                    <td className="border border-[var(--color-secondary)] p-2">
                      {p.name}
                    </td>
                    <td className="border border-[var(--color-secondary)] p-2">
                      {p.slug}
                    </td>
                    <td className="border border-[var(--color-secondary)] p-2">
                      ${p.price}
                    </td>
                    <td className="border border-[var(--color-secondary)] p-2">
                      {p.categories && p.categories.length > 0
                        ? p.categories.map((cat) => cat.name).join(", ")
                        : "None"}
                    </td>
                    <td className="border border-[var(--color-secondary)] p-2">
                      {p.stockQuantity}
                    </td>
                    <td className="border border-[var(--color-secondary)] p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-[var(--color-accent)] hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[var(--background)] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {isEditing ? "Edit Product" : "Create Product"}
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-[var(--color-secondary)] p-2 rounded"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Slug (Auto-generated)
                  </label>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="w-full border border-[var(--color-secondary)] p-2 rounded bg-[var(--background)]"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-[var(--color-secondary)] p-2 rounded"
                    rows={3}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full border border-[var(--color-secondary)] p-2 rounded"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">Categories</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.selectedCategories.map((c) => (
                      <span
                        key={c.id}
                        className="flex items-center bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)] px-2 py-1 rounded"
                      >
                        {c.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(c.id)}
                          className="ml-1 text-[var(--color-accent)] hover:text-[var(--color-accent)]"
                          disabled={submitting}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    list="category-list"
                    value={form.categoryInput}
                    onChange={handleCategoryInputChange}
                    placeholder="Type or select categories…"
                    className="w-full border border-[var(--color-secondary)] p-2 rounded"
                    disabled={submitting}
                  />
                  <datalist id="category-list">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="mt-2 px-4 py-2 bg-green-600 text-[var(--foreground)] rounded hover:bg-green-700"
                    disabled={submitting}
                  >
                    Add Category
                  </button>
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-[var(--color-secondary)] p-2 rounded"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="w-full border border-[var(--color-secondary)] p-2 rounded"
                    disabled={submitting}
                  />
                  {files.length > 0 && (
                    <div className="mt-2 text-sm text-[var(--color-secondary)]">
                      {files.length} file(s) selected
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-[var(--color-secondary)] rounded hover:bg-[var(--background)]"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--color-primary)] text-[var(--foreground)] rounded hover:bg-[var(--color-accent)] disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting
                      ? isEditing
                        ? "Saving..."
                        : "Creating..."
                      : isEditing
                      ? "Save Changes"
                      : "Create"}
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
