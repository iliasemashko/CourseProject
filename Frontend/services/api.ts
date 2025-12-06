// api.ts
import { Product, User, Order, OrderItem } from '../types';

const API_BASE = 'http://localhost:5114/api';
const TOKEN_KEY = 'santeh_token';
let jwtToken: string | null = null;

// Initialize token from localStorage so auth persists across reloads
(function initToken() {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    jwtToken = t || null;
  } catch (e) {
    jwtToken = null;
  }
})();

export function setToken(token: string | null) {
  jwtToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // ignore localStorage errors
  }
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
  return transformUser(data);
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
  return transformUser(data);
}

// ---------- Products ----------
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  console.log('API Response from /api/products:', data);
  // Преобразуем camelCase из API в PascalCase для Frontend
  if (Array.isArray(data)) {
    return data.map((p: any) => ({
      ProductId: p.productId || p.ProductId,
      Name: p.name || p.Name,
      Description: p.description || p.Description,
      Price: p.price || p.Price,
      Category: p.category || p.Category,
      Stock: p.stock || p.Stock,
      CreatedAt: p.createdAt || p.CreatedAt || new Date().toISOString(),
      ImageUrl: p.imageUrl || p.ImageUrl || (p.productId ? `${API_BASE}/products/${p.productId}/image` : undefined),
      Image: p.image || p.Image,
      ImageName: p.imageName || p.ImageName,
      ImageType: p.imageType || p.ImageType,
    } as Product));
  }
  return data;
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
  const data = await res.json();

  // Normalize server response (camelCase or PascalCase) into frontend `Order` shape
  if (Array.isArray(data)) {
    return data.map((o: any) => ({
      OrderId: o.orderId ?? o.OrderId,
      UserId: o.userId ?? o.UserId,
      StatusId: o.statusId ?? o.StatusId,
      TotalAmount: o.totalAmount ?? o.TotalAmount,
      CreatedAt: o.createdAt ?? o.CreatedAt,
      UpdatedAt: o.updatedAt ?? o.UpdatedAt,
      UserName: o.userName ?? o.UserName ?? `User ${o.userId ?? o.UserId}`,
      Items: Array.isArray(o.items)
        ? o.items.map((i: any) => ({
            OrderItemId: i.orderItemId ?? i.OrderItemId,
            OrderId: i.orderId ?? i.OrderId,
            ProductId: i.productId ?? i.ProductId,
            Quantity: i.quantity ?? i.Quantity,
            Price: i.price ?? i.Price,
            ProductName: i.product?.name ?? i.product?.Name ?? i.productName ?? i.ProductName,
            Product: i.product
              ? {
                  ProductId: i.product.productId ?? i.product.ProductId,
                  Name: i.product.name ?? i.product.Name,
                  Price: i.product.price ?? i.product.Price,
                  Description: i.product.description ?? i.product.Description,
                  Category: i.product.category ?? i.product.Category,
                  Stock: i.product.stock ?? i.product.Stock,
                  CreatedAt: i.product.createdAt ?? i.product.CreatedAt ?? new Date().toISOString(),
                  ImageUrl: i.product.imageUrl ?? i.product.ImageUrl,
                }
              : undefined,
          }))
        : [],
      AssignedToUserId: o.assignedToUserId ?? o.AssignedToUserId,
      AssignedToName: o.assignedToName ?? o.AssignedToName,
    } as Order));
  }

  return [];
}

export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const o = await res.json();

  // Normalize server response (camelCase or PascalCase) into frontend `Order` shape
  return {
    OrderId: o.orderId ?? o.OrderId,
    UserId: o.userId ?? o.UserId,
    StatusId: o.statusId ?? o.StatusId,
    TotalAmount: o.totalAmount ?? o.TotalAmount,
    CreatedAt: o.createdAt ?? o.CreatedAt,
    UpdatedAt: o.updatedAt ?? o.UpdatedAt,
    UserName: o.userName ?? o.UserName ?? `User ${o.userId ?? o.UserId}`,
    Items: Array.isArray(o.items)
      ? o.items.map((i: any) => ({
          OrderItemId: i.orderItemId ?? i.OrderItemId,
          OrderId: i.orderId ?? i.OrderId,
          ProductId: i.productId ?? i.ProductId,
          Quantity: i.quantity ?? i.Quantity,
          Price: i.price ?? i.Price,
          ProductName: i.product?.name ?? i.product?.Name ?? i.productName ?? i.ProductName,
          Product: i.product
            ? {
                ProductId: i.product.productId ?? i.product.ProductId,
                Name: i.product.name ?? i.product.Name,
                Price: i.product.price ?? i.product.Price,
                Description: i.product.description ?? i.product.Description,
                Category: i.product.category ?? i.product.Category,
                Stock: i.product.stock ?? i.product.Stock,
                CreatedAt: i.product.createdAt ?? i.product.CreatedAt ?? new Date().toISOString(),
                ImageUrl: i.product.imageUrl ?? i.product.ImageUrl,
              }
            : undefined,
        }))
      : [],
    AssignedToUserId: o.assignedToUserId ?? o.AssignedToUserId,
    AssignedToName: o.assignedToName ?? o.AssignedToName,
  } as Order;
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

export async function assignOrder(orderId: number, employeeId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/assign`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ assignedToUserId: employeeId }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteOrder(orderId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
}

// ---------- Comments ----------
export async function getComments(orderId: number) {
    const response = await fetch(`${API_BASE}/orders/${orderId}/comments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to load comments');
    }

    return await response.json();
}

export async function addComment(orderId: number, text: string): Promise<any> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------- User ----------
export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/user/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return transformUser(data);
}

export async function updateUser(user: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/user`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return transformUser(data);
}

// Helper function to transform user data (camelCase to PascalCase)
function transformUser(data: any): User {
  return {
    UserId: data.userId || data.UserId,
    RoleId: data.roleId || data.RoleId,
    Surname: data.surname || data.Surname,
    Name: data.name || data.Name,
    Patronymic: data.patronymic || data.Patronymic,
    FullName: data.fullName || data.FullName,
    Email: data.email || data.Email,
    Phone: data.phone || data.Phone,
    PasswordHash: data.passwordHash || data.PasswordHash,
    CreatedAt: data.createdAt || data.CreatedAt,
    IsBlocked: data.isBlocked || data.IsBlocked,
  };
}