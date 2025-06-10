// frontend/src/services/order-api.ts

// Root for API calls: either explicit NEXT_PUBLIC_API_URL or proxy via /api
import { API_ROOT } from "@/config/api";

/**
 * One item in an order
 */
export type OrderItemAPI = {
  id: number;
  product: { id: number; name?: string };
  variant?: { id: number; sku?: string };
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

/**
 * One status‐change record
 */
export type OrderStatusHistoryAPI = {
  id: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  comment: string | null;
  createdBy: number | null;
  createdAt: string;
};

/**
 * Full Order shape from backend
 */
export type OrderAPI = {
  id: number;
  guestName: string;
  guestEmail: string;
  status: OrderStatusHistoryAPI["status"];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemAPI[];
  statusHistory: OrderStatusHistoryAPI[];
  deletedAt: string | null;
};

/**
 * Payload to create an order (matches CreateOrderDto)
 */
export type CreateOrderPayload = {
  guestName: string;
  guestEmail: string;
  shippingAddress: string;
  billingAddress: string;
  paymentMethod?: string;
  items: { productId: number; quantity: number }[];
};

/**
 * Payload to update an order (matches UpdateOrderDto)
 */
export type UpdateOrderPayload = Partial<CreateOrderPayload> & {
  status?: OrderStatusHistoryAPI["status"];
  comment?: string;
};

// ─── UTIL ───────────────────────────────────────────────────────────
async function handleResponse<T = unknown>(res: Response): Promise<T> {
  if (res.status === 401 || res.status === 403) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── GUEST FLOWS ────────────────────────────────────────────────────

/** Place a new guest order (tied to sessionId cookie) */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<OrderAPI> {
  const res = await fetch(`${API_ROOT}/orders`, {
    method: "POST",
    credentials: "include", // ← send sessionId cookie
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Fetch your own guest order by ID */
export async function fetchOrderById(id: number | string): Promise<OrderAPI> {
  const res = await fetch(`${API_ROOT}/orders/${id}`, {
    credentials: "include", // ← send sessionId cookie
    cache: "no-store",
  });
  return handleResponse(res);
}

// ─── ADMIN FLOWS ────────────────────────────────────────────────────

/** List all orders (admin only) */
export async function fetchOrders(
  withDeleted: boolean = false
): Promise<OrderAPI[]> {
  const query = withDeleted ? "?withDeleted=true" : "";
  const res = await fetch(`${API_ROOT}/orders${query}`, {
    method: "GET",
    credentials: "include", // ← send JWT cookie
    cache: "no-store",
  });
  return handleResponse(res);
}

/** Update an existing order (admin only) */
export async function updateOrder(
  id: number,
  payload: UpdateOrderPayload
): Promise<OrderAPI> {
  const res = await fetch(`${API_ROOT}/orders/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Soft-delete an order (admin only) */
export async function deleteOrder(id: number): Promise<void> {
  const res = await fetch(`${API_ROOT}/orders/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await handleResponse(res);
}

/** Restore a soft-deleted order (admin only) */
export async function restoreOrder(id: number): Promise<void> {
  const res = await fetch(`${API_ROOT}/orders/${id}/restore`, {
    method: "POST",
    credentials: "include",
  });
  await handleResponse(res);
}

/** Mark as delivered (admin only) */
export async function completeOrder(id: number): Promise<OrderAPI> {
  const res = await fetch(`${API_ROOT}/orders/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "delivered" }),
  });
  return handleResponse(res);
}
