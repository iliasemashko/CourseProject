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
  PasswordHash?: string;
  CreatedAt: string;
}

export interface CreateUserDto {
  FullName: string;
  Email: string;
  Password: string;
  RoleId?: number;
}

export interface UpdateUserDto {

  FullName: string;
  Email: string;
  Password: string;
  RoleId?: number;
}

export interface Product {
  ProductId: number;
  Name: string;
  Description: string;
  Price: number;
  Category: string;
  Stock: number;
  CreatedAt: string;
  ImageUrl?: string;    // URL для отображения на фронтенде
  Image?: File;         // выбранный файл перед отправкой
  ImageName?: string;   // имя файла на сервере после загрузки
  ImageType?: string;   // MIME-тип файла
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
  UserName?: string;
  StatusId: OrderStatus;
  TotalAmount: number;
  CreatedAt: string;
  UpdatedAt: string;
  AssignedToUserId?: number;
  AssignedToName?: string;
  Items?: OrderItem[];
  OrderType?: string;
}


export interface Comment {
  commentId: number;
  orderId: number;
  userId: number;
  userName: string;
  text: string;
  createdAt: string;
}


export interface CartItem extends Product {
  quantity: number;
}