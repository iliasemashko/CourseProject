import { User, Product, Order, OrderItem, Comment, Role } from '../types';
import { INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_ORDERS, INITIAL_ORDER_ITEMS } from '../constants';

const KEYS = {
  USERS: 'santeh_users',
  PRODUCTS: 'santeh_products',
  ORDERS: 'santeh_orders',
  ORDER_ITEMS: 'santeh_order_items',
  COMMENTS: 'santeh_comments',
  CURRENT_USER: 'santeh_current_user'
};

// Initialize DB if empty
const init = () => {
  if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  if (!localStorage.getItem(KEYS.PRODUCTS)) localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  if (!localStorage.getItem(KEYS.ORDERS)) localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  if (!localStorage.getItem(KEYS.ORDER_ITEMS)) localStorage.setItem(KEYS.ORDER_ITEMS, JSON.stringify(INITIAL_ORDER_ITEMS));
};
init();

// Helpers
const get = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const set = <T>(key: string, data: T[]) => localStorage.setItem(key, JSON.stringify(data));

export const StorageService = {
  // Products
  getProducts: (): Product[] => get<Product>(KEYS.PRODUCTS),
  saveProduct: (product: Product) => {
    const products = get<Product>(KEYS.PRODUCTS);
    if (product.ProductId) {
      const idx = products.findIndex(p => p.ProductId === product.ProductId);
      if (idx > -1) products[idx] = product;
    } else {
      product.ProductId = Date.now();
      product.CreatedAt = new Date().toISOString();
      products.push(product);
    }
    set(KEYS.PRODUCTS, products);
  },
  deleteProduct: (id: number) => {
    const products = get<Product>(KEYS.PRODUCTS).filter(p => p.ProductId !== id);
    set(KEYS.PRODUCTS, products);
  },

  // Auth
  login: (email: string, pass: string): User | null => {
    const users = get<User>(KEYS.USERS);
    const user = users.find(u => u.Email === email && u.PasswordHash === pass);
    if (user) {
      if (user.IsBlocked) return null; // Blocked user check
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },
  register: (user: Partial<User>): User => {
    const users = get<User>(KEYS.USERS);
    const newUser = {
      ...user,
      UserId: Date.now(),
      RoleId: user.RoleId || Role.CLIENT,
      CreatedAt: new Date().toISOString(),
      IsBlocked: false
    } as User;
    users.push(newUser);
    set(KEYS.USERS, users);
    // Only auto-login if it's a client self-registering (not admin creating user)
    if (!user.RoleId || user.RoleId === Role.CLIENT) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
    }
    return newUser;
  },
  logout: () => localStorage.removeItem(KEYS.CURRENT_USER),
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  },
  getAllUsers: (): User[] => get<User>(KEYS.USERS),
  updateUser: (user: User) => {
      const users = get<User>(KEYS.USERS);
      const idx = users.findIndex(u => u.UserId === user.UserId);
      if (idx > -1) {
          users[idx] = user;
          set(KEYS.USERS, users);
          // Update session if it's the current user
          const current = StorageService.getCurrentUser();
          if(current && current.UserId === user.UserId) {
              localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
          }
      }
  },
  toggleUserBlock: (userId: number) => {
    const users = get<User>(KEYS.USERS);
    const user = users.find(u => u.UserId === userId);
    if (user && user.RoleId !== Role.ADMIN) { // Prevent blocking main admin if possible, or just be careful
        user.IsBlocked = !user.IsBlocked;
        set(KEYS.USERS, users);
    }
  },

  // Orders
  getOrders: (): Order[] => {
    const orders = get<Order>(KEYS.ORDERS);
    const users = get<User>(KEYS.USERS);
    return orders.map(o => ({
      ...o,
      UserName: users.find(u => u.UserId === o.UserId)?.FullName || 'Unknown',
      AssignedToName: o.AssignedToUserId ? users.find(u => u.UserId === o.AssignedToUserId)?.FullName : undefined
    })).sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
  },
  createOrder: (userId: number, items: { product: Product, quantity: number }[]) => {
    const orders = get<Order>(KEYS.ORDERS);
    const orderItems = get<OrderItem>(KEYS.ORDER_ITEMS);
    
    const total = items.reduce((sum, item) => sum + (item.product.Price * item.quantity), 0);
    
    const newOrder: Order = {
      OrderId: Date.now(),
      UserId: userId,
      StatusId: 1, // Created
      TotalAmount: total,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    set(KEYS.ORDERS, orders);

    items.forEach(item => {
      orderItems.push({
        OrderItemId: Math.random(), // simple mock id
        OrderId: newOrder.OrderId,
        ProductId: item.product.ProductId,
        Quantity: item.quantity,
        Price: item.product.Price
      });
    });
    set(KEYS.ORDER_ITEMS, orderItems);
    return newOrder;
  },
  updateOrderStatus: (orderId: number, statusId: number) => {
    const orders = get<Order>(KEYS.ORDERS);
    const order = orders.find(o => o.OrderId === orderId);
    if (order) {
      order.StatusId = statusId;
      order.UpdatedAt = new Date().toISOString();
      set(KEYS.ORDERS, orders);
    }
  },
  assignOrder: (orderId: number, employeeId: number) => {
    const orders = get<Order>(KEYS.ORDERS);
    const order = orders.find(o => o.OrderId === orderId);
    if (order) {
      order.AssignedToUserId = employeeId;
      order.UpdatedAt = new Date().toISOString();
      set(KEYS.ORDERS, orders);
    }
  },
  getOrderItems: (orderId: number): OrderItem[] => {
      const items = get<OrderItem>(KEYS.ORDER_ITEMS).filter(i => i.OrderId === orderId);
      const products = get<Product>(KEYS.PRODUCTS);
      return items.map(i => ({
          ...i,
          ProductName: products.find(p => p.ProductId === i.ProductId)?.Name || 'Deleted Product'
      }));
  },

  // Comments
  getComments: (orderId: number): Comment[] => {
      const comments = get<Comment>(KEYS.COMMENTS).filter(c => c.OrderId === orderId);
      const users = get<User>(KEYS.USERS);
      return comments.map(c => ({
          ...c,
          UserName: users.find(u => u.UserId === c.UserId)?.FullName || 'Unknown'
      })).sort((a,b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime());
  },
  addComment: (orderId: number, userId: number, text: string) => {
      const comments = get<Comment>(KEYS.COMMENTS);
      comments.push({
          CommentId: Date.now(),
          OrderId: orderId,
          UserId: userId,
          Text: text,
          CreatedAt: new Date().toISOString()
      });
      set(KEYS.COMMENTS, comments);
  },

  // Data Management
  getFullDatabase: () => {
    return {
      users: get<User>(KEYS.USERS),
      products: get<Product>(KEYS.PRODUCTS),
      orders: get<Order>(KEYS.ORDERS),
      orderItems: get<OrderItem>(KEYS.ORDER_ITEMS),
      comments: get<Comment>(KEYS.COMMENTS),
    };
  },
  
  importData: (data: any): boolean => {
      try {
          if (data.users && Array.isArray(data.users)) set(KEYS.USERS, data.users);
          if (data.products && Array.isArray(data.products)) set(KEYS.PRODUCTS, data.products);
          if (data.orders && Array.isArray(data.orders)) set(KEYS.ORDERS, data.orders);
          if (data.orderItems && Array.isArray(data.orderItems)) set(KEYS.ORDER_ITEMS, data.orderItems);
          if (data.comments && Array.isArray(data.comments)) set(KEYS.COMMENTS, data.comments);
          return true;
      } catch (e) {
          console.error("Import failed", e);
          return false;
      }
  }
};