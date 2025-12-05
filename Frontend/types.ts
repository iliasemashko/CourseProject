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
  Surname: string;
  Name: string;
  Patronymic?: string;
  FullName: string;
  Email: string;
  Phone?: string;
  PasswordHash?: string;
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
  ImageUrl?: string;
  Image?: Uint8Array;
  ImageName?: string;
  ImageType?: string;
}

export interface OrderItem {
  OrderItemId: number;
  OrderId: number;
  ProductId: number;
  Quantity: number;
  Price: number;
  ProductName?: string;
  Product?: Product;
}

export interface Order {
  OrderId: number;
  UserId: number;
  StatusId: OrderStatus;
  TotalAmount: number;
  CreatedAt: string;
  UpdatedAt: string;
  UserName?: string;
  Items?: OrderItem[];
  AssignedToUserId?: number;
  AssignedToName?: string;
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