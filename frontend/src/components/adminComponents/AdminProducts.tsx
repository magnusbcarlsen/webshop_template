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
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

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

export default function AdminProducts() {
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
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [categories, setCategories] = useState<CategoryAPI[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? `Failed to load products: ${err.message}`
          : "Failed to load products"
      );
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
    setFiles([]);
    onOpen();
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
    onOpen();
  }

  function closeModal() {
    setEditingId(null);
    setForm(initialForm);
    setFiles([]);
    setError(null);
  }

  async function handleSubmit(e: FormEvent | { preventDefault?: () => void }) {
    if (e.preventDefault) e.preventDefault();
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

      onOpenChange();
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
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  const activeProducts = products.filter((p) => p.isActive);
  const inactiveProducts = products.filter((p) => !p.isActive);

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">
              Manage your product catalog and inventory
            </p>
          </div>
          <Button
            onPress={openCreateModal}
            color="primary"
            size="lg"
            className="mt-4 lg:mt-0 bg-black text-white font-semibold px-6"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Active Products
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {activeProducts.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Categories
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Products</h2>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Create your first product to get started
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "ID",
                      "Name",
                      "Slug",
                      "Price",
                      "Categories",
                      "Stock",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        #{product.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.slug}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-semibold text-gray-900">
                          DKK {product.price}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.categories &&
                          product.categories.length > 0 ? (
                            product.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                              >
                                {cat.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.stockQuantity > 10
                              ? "bg-green-100 text-green-800"
                              : product.stockQuantity > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stockQuantity} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => openEditModal(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => handleDelete(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">
                  {isEditing ? "Edit Product" : "Create Product"}
                </h2>
              </ModalHeader>
              <ModalBody className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-red-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submitting}
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug (Auto-generated)
                      </label>
                      <input
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submitting}
                        placeholder="product-url-slug"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      disabled={submitting}
                      placeholder="Product description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (DKK) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={form.stockQuantity}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submitting}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.selectedCategories.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {c.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(c.id)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                            disabled={submitting}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        list="category-list"
                        value={form.categoryInput}
                        onChange={handleCategoryInputChange}
                        placeholder="Type or select categories..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                        disabled={submitting}
                      >
                        Add
                      </button>
                    </div>
                    <datalist id="category-list">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setFiles(Array.from(e.target.files || []))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submitting}
                    />
                    {files.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {files.length} file(s) selected
                      </div>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    closeModal();
                    onClose();
                  }}
                  isDisabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSubmit({})}
                  isDisabled={submitting}
                  className="bg-black text-white"
                >
                  {submitting
                    ? isEditing
                      ? "Saving..."
                      : "Creating..."
                    : isEditing
                    ? "Save Changes"
                    : "Create Product"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
