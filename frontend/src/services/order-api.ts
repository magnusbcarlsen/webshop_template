// frontend/src/services/order-api.ts

// Root for API calls: either explicit NEXT_PUBLIC_API_URL or proxy via /api
const API_ROOT = process.env.NEXT_PUBLIC_API_URL ?? "/api";

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
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
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
  // if you add status/comments in your UpdateOrderDto later, add them here:
  status?: OrderStatusHistoryAPI["status"];
  comment?: string;
};

/**
 * Fetch all orders
 */
export async function fetchOrders(): Promise<OrderAPI[]> {
  const res = await fetch(`${API_ROOT}/orders`);
  if (!res.ok) throw new Error(`Fetch orders failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(
  id: number | string
): Promise<OrderAPI> {
  const res = await fetch(`${API_ROOT}/orders/${id}`);
  if (!res.ok) throw new Error(`Fetch order ${id} failed: ${res.status}`);
  return res.json();
}

/**
 * Create a new order
 */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<OrderAPI> {
  const res = await fetch(`${API_ROOT}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create order failed: ${res.status}`);
  return res.json();
}

/**
 * Update an existing order
 */
export async function updateOrder(
  id: number,
  payload: UpdateOrderPayload
): Promise<OrderAPI> {
  const res = await fetch(`${API_ROOT}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update order ${id} failed: ${res.status}`);
  return res.json();
}

/**
 * Delete an order by ID
 */
export async function deleteOrder(id: number): Promise<void> {
  const res = await fetch(`${API_ROOT}/orders/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete order ${id} failed: ${res.status}`);
}
