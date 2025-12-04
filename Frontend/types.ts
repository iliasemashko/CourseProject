export enum Role {
  CLIENT = 1,
  EMPLOYEE = 2,
  ADMIN = 3
}

export enum OrderStatus {
  CREATED = 1,      // Создан
  PROCESSING = 2,   // Принят к обработке
  ASSEMBLED = 3,    // Собран
  READY = 4,        // Готов к выдаче
  COMPLETED = 5,    // Выполнен (Архив)
  CANCELLED = 6     // Отменён
}

export interface User {
  UserId: number;
  RoleId: Role;
  FullName: string;
  Email: string;
  Phone?: string;
  PasswordHash?: string; // In a real app, never store/send this to frontend
  CreatedAt: string;
  IsBlocked?: boolean;
}

export interface Product {
  ProductId: number;
  Name: string;
  Description: string;
  Price: number;
  Category: string;
  Stock: number;
  CreatedAt: string;
}

export interface OrderItem {
  OrderItemId: number;
  OrderId: number;
  ProductId: number;
  Quantity: number;
  Price: number;
  ProductName?: string; // Joined field for UI
}

export interface Order {
  OrderId: number;
  UserId: number;
  StatusId: OrderStatus;
  TotalAmount: number;
  CreatedAt: string;
  UpdatedAt: string;
  UserName?: string; // Joined field for UI
  Items?: OrderItem[];
  AssignedToUserId?: number; // Employee ID
  AssignedToName?: string; // Employee Name for UI
}

export interface Comment {
  CommentId: number;
  OrderId: number;
  UserId: number;
  Text: string;
  CreatedAt: string;
  UserName?: string;
}

export interface CartItem extends Product {
  quantity: number;
}