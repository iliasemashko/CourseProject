import { Role, OrderStatus, Product, User, Order, OrderItem } from './types';

const product1 = '/assets/product1.jpg';
const product2 = '/assets/product2.jpg';
const product3 = '/assets/product3.jpg';
const product4 = '/assets/product4.jpg';
const product5 = '/assets/product5.jpg';
const product6 = '/assets/product6.jpg';

export const INITIAL_PRODUCTS: Product[] = [
   { ProductId: 1, Name: 'Смеситель Grohe Eurosmart', Description: 'Однорычажный смеситель для раковины, хром.', Price: 5200, Category: 'Смесители', Stock: 15, CreatedAt: new Date().toISOString(), ImageUrl: product1 },
  { ProductId: 2, Name: 'Ванна акриловая Cersanit', Description: 'Прямоугольная ванна 170x70 см, белый.', Price: 12500, Category: 'Ванны', Stock: 5, CreatedAt: new Date().toISOString(), ImageUrl: product2 },
  { ProductId: 3, Name: 'Труба полипропиленовая 20мм', Description: 'Армированная стекловолокном, цена за метр.', Price: 85, Category: 'Трубы', Stock: 500, CreatedAt: new Date().toISOString(), ImageUrl: product3 },
  { ProductId: 4, Name: 'Унитаз-компакт Roca', Description: 'Безободковый, с сиденьем микролифт.', Price: 9800, Category: 'Санфаянс', Stock: 8, CreatedAt: new Date().toISOString(), ImageUrl: product4 },
  { ProductId: 5, Name: 'Полотенцесушитель Водяной', Description: 'М-образный, нержавеющая сталь 50x50.', Price: 2100, Category: 'Отопление', Stock: 20, CreatedAt: new Date().toISOString(), ImageUrl: product5 },
  { ProductId: 6, Name: 'Сифон для ванны', Description: 'Полуавтомат, пластик/хром.', Price: 1200, Category: 'Комплектующие', Stock: 45, CreatedAt: new Date().toISOString(), ImageUrl: product6 },
];

export const INITIAL_USERS: User[] = [
  { UserId: 1, RoleId: Role.ADMIN, FullName: 'Администратор Системы', Email: 'admin@santeh.ru', PasswordHash: 'admin123', CreatedAt: new Date().toISOString(), IsBlocked: false },
  { UserId: 2, RoleId: Role.EMPLOYEE, FullName: 'Иван Менеджер', Email: 'manager@santeh.ru', PasswordHash: 'manager123', Phone: '+79001112233', CreatedAt: new Date().toISOString(), IsBlocked: false },
  { UserId: 3, RoleId: Role.CLIENT, FullName: 'Петр Клиентов', Email: 'client@mail.ru', PasswordHash: 'client123', Phone: '+79998887766', CreatedAt: new Date().toISOString(), IsBlocked: false },
];

export const INITIAL_ORDERS: Order[] = [
  { OrderId: 1, UserId: 3, StatusId: OrderStatus.COMPLETED, TotalAmount: 13700, CreatedAt: new Date(Date.now() - 86400000 * 5).toISOString(), UpdatedAt: new Date().toISOString(), AssignedToUserId: 2 },
  { OrderId: 2, UserId: 3, StatusId: OrderStatus.CREATED, TotalAmount: 5200, CreatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), UpdatedAt: new Date().toISOString() },
];

export const INITIAL_ORDER_ITEMS: OrderItem[] = [
  { OrderItemId: 1, OrderId: 1, ProductId: 2, Quantity: 1, Price: 12500 },
  { OrderItemId: 2, OrderId: 1, ProductId: 6, Quantity: 1, Price: 1200 },
  { OrderItemId: 3, OrderId: 2, ProductId: 1, Quantity: 1, Price: 5200 },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'Новый',
  [OrderStatus.PROCESSING]: 'В обработке',
  [OrderStatus.ASSEMBLED]: 'Собран',
  [OrderStatus.COMPLETED]: 'Выполнен'
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.CREATED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PROCESSING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.ASSEMBLED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800'
};