// frontend/src/services/exhibition-api.ts
import { API_ROOT } from "@/config/api";

export type ExhibitionAPI = {
  id: number;
  title: string;
  description: string | null;
  location: string;
  imageUrl: string | null;
  externalUrl: string | null;
  eventStartDate: string | null; // YYYY-MM-DD
  eventEndDate: string | null;
  displayFrom: string | null;
  displayUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

async function handleResponse<T = unknown>(res: Response): Promise<T> {
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const errPayload = await res.json().catch(() => null);
    const raw = errPayload?.message;
    const msg = Array.isArray(raw)
      ? raw.join("; ")
      : raw || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

// Public — used by the frontpage.
export async function fetchActiveExhibitions(): Promise<ExhibitionAPI[]> {
  const res = await fetch(`${API_ROOT}/exhibitions/active`, {
    cache: "no-store",
  });
  return handleResponse(res);
}

// Admin
export async function fetchAllExhibitions(): Promise<ExhibitionAPI[]> {
  const res = await fetch(`${API_ROOT}/exhibitions`, {
    cache: "no-store",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function fetchExhibition(id: number): Promise<ExhibitionAPI> {
  const res = await fetch(`${API_ROOT}/exhibitions/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function createExhibition(
  payload: FormData,
): Promise<ExhibitionAPI> {
  const res = await fetch(`${API_ROOT}/exhibitions`, {
    method: "POST",
    credentials: "include",
    body: payload,
  });
  return handleResponse(res);
}

export async function updateExhibition(
  id: number,
  payload: FormData,
): Promise<ExhibitionAPI> {
  const res = await fetch(`${API_ROOT}/exhibitions/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: payload,
  });
  return handleResponse(res);
}

export async function deleteExhibition(id: number): Promise<void> {
  const res = await fetch(`${API_ROOT}/exhibitions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse(res);
}
