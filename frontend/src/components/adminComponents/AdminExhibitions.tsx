// frontend/src/components/adminComponents/AdminExhibitions.tsx
"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import {
  fetchAllExhibitions,
  fetchExhibition,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  ExhibitionAPI,
} from "@/services/exhibition-api";

interface ExhibitionForm {
  title: string;
  description: string;
  location: string;
  externalUrl: string;
  eventStartDate: string;
  eventEndDate: string;
  displayFrom: string;
  displayUntil: string;
  isActive: boolean;
  removeImage: boolean;
}

const blankForm: ExhibitionForm = {
  title: "",
  description: "",
  location: "",
  externalUrl: "",
  eventStartDate: "",
  eventEndDate: "",
  displayFrom: "",
  displayUntil: "",
  isActive: true,
  removeImage: false,
};

function formatDate(d: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(d));
}

export default function AdminExhibitions() {
  const [items, setItems] = useState<ExhibitionAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ExhibitionForm>(blankForm);
  const [file, setFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const rows = await fetchAllExhibitions();
      setItems(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(blankForm);
    setFile(null);
    setExistingImageUrl(null);
    setError(null);
    onOpen();
  }

  async function openEdit(id: number) {
    setEditingId(id);
    setError(null);
    setFile(null);
    try {
      const row = await fetchExhibition(id);
      setForm({
        title: row.title,
        description: row.description,
        location: row.location,
        externalUrl: row.externalUrl ?? "",
        eventStartDate: row.eventStartDate,
        eventEndDate: row.eventEndDate,
        displayFrom: row.displayFrom,
        displayUntil: row.displayUntil,
        isActive: row.isActive,
        removeImage: false,
      });
      setExistingImageUrl(row.imageUrl);
      onOpen();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load row");
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((f) => ({ ...f, [name]: checked }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  }

  function buildPayload(): FormData {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("location", form.location);
    if (form.externalUrl.trim()) fd.append("externalUrl", form.externalUrl);
    fd.append("eventStartDate", form.eventStartDate);
    fd.append("eventEndDate", form.eventEndDate);
    fd.append("displayFrom", form.displayFrom);
    fd.append("displayUntil", form.displayUntil);
    fd.append("isActive", String(form.isActive));
    if (file) fd.append("image", file);
    if (editingId !== null && form.removeImage && !file) {
      fd.append("removeImage", "true");
    }
    return fd;
  }

  async function handleSubmit(e: FormEvent | { preventDefault?: () => void }) {
    if (e.preventDefault) e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingId !== null) {
        await updateExhibition(editingId, buildPayload());
      } else {
        await createExhibition(buildPayload());
      }
      onOpenChange();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this exhibition? This cannot be undone.")) return;
    try {
      await deleteExhibition(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleToggleActive(row: ExhibitionAPI) {
    const fd = new FormData();
    fd.append("isActive", String(!row.isActive));
    try {
      await updateExhibition(row.id, fd);
      setItems((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, isActive: !row.isActive } : r,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Exhibitions</h1>
          <p className="text-gray-600">Manage upcoming-exhibition announcements</p>
        </div>
        <Button
          onPress={openCreate}
          color="primary"
          size="lg"
          className="bg-black text-white font-semibold px-6"
        >
          New exhibition
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">No exhibitions yet. Create one to start.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Title", "Event", "Display window", "Active", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {row.title}
                    <div className="text-sm text-gray-500">{row.location}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(row.eventStartDate)} – {formatDate(row.eventEndDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(row.displayFrom)} – {formatDate(row.displayUntil)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(row)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                        row.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => openEdit(row.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => handleDelete(row.id)}
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
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold">
                  {editingId !== null ? "Edit exhibition" : "New exhibition"}
                </h2>
              </ModalHeader>
              <ModalBody className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event start *
                      </label>
                      <input
                        type="date"
                        name="eventStartDate"
                        value={form.eventStartDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event end *
                      </label>
                      <input
                        type="date"
                        name="eventEndDate"
                        value={form.eventEndDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display from *
                      </label>
                      <input
                        type="date"
                        name="displayFrom"
                        value={form.displayFrom}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display until *
                      </label>
                      <input
                        type="date"
                        name="displayUntil"
                        value={form.displayUntil}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      External link (optional)
                    </label>
                    <input
                      name="externalUrl"
                      value={form.externalUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image (optional)
                    </label>
                    {existingImageUrl && !file && !form.removeImage && (
                      <div className="mb-2 text-sm">
                        Current image:{" "}
                        <a
                          href={existingImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          view
                        </a>
                        <label className="ml-3 inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="removeImage"
                            checked={form.removeImage}
                            onChange={handleChange}
                          />
                          Remove
                        </label>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={onClose}
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
                    ? "Saving..."
                    : editingId !== null
                      ? "Save"
                      : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
