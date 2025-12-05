// api.ts
import { Product, User, Order, OrderItem } from '../types';

const API_BASE = 'http://localhost:5114/api';
let jwtToken: string | null = null;

export function setToken(token: string | null) {
  jwtToken = token;
}

function authHeaders() {
  if (!jwtToken) throw new Error("Not authenticated");
  return {
    Authorization: `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  };
}

// ---------- Auth ----------
export async function registerUser(fullName: string, email: string, password: string, roleId: number = 1): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ FullName: fullName, Email: email, Password: password, RoleId: roleId }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  setToken(data.token);
  return { ...data };
}

export async function loginUser(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email: email, Password: password }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  setToken(data.token);
  return { ...data };
}

// ---------- Products ----------
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createProduct(product: Partial<Product>, imageFile?: File): Promise<Product> {
  if (!jwtToken) throw new Error("Not authenticated");
  
  const formData = new FormData();
  if (product.Name) formData.append('name', product.Name);
  if (product.Price != null) formData.append('price', product.Price.toString());
  if (product.Description) formData.append('description', product.Description);
  if (product.Category) formData.append('category', product.Category);
  if (product.Stock != null) formData.append('stock', product.Stock.toString());
  if (imageFile) formData.append('image', imageFile);
  
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwtToken}` },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
}

// ---------- Orders ----------
export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateOrderStatus(orderId: number, statusId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(statusId),
  });
  if (!res.ok) throw new Error(await res.text());
}