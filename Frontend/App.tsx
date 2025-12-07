// import React, { useState, useEffect } from 'react';
// import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import AIChat from './components/AIChat';
// import Catalog from './pages/Catalog';
// import Cart from './pages/Cart';
// import Login from './pages/Login';
// import Orders from './pages/Orders';
// import OrderDetail from './pages/OrderDetail';
// import Dashboard from './pages/Dashboard';
// import Profile from './pages/Profile';
// import { StorageService } from './services/storageService';
// import { User, CartItem, Product, Role } from './types';

// const App: React.FC = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [cart, setCart] = useState<CartItem[]>([]);

//   useEffect(() => {
//     // Check session
//     const currentUser = StorageService.getCurrentUser();
//     if (currentUser) setUser(currentUser);
//   }, []);

//   const addToCart = (product: Product) => {
//     setCart(prev => {
//       const existing = prev.find(i => i.ProductId === product.ProductId);
//       if (existing) {
//         return prev.map(i => i.ProductId === product.ProductId ? { ...i, quantity: i.quantity + 1 } : i);
//       }
//       return [...prev, { ...product, quantity: 1 }];
//     });
//   };

//   const updateQuantity = (id: number, delta: number) => {
//     setCart(prev => prev.map(item => {
//       if (item.ProductId === id) {
//         const newQ = item.quantity + delta;
//         return newQ > 0 ? { ...item, quantity: newQ } : item;
//       }
//       return item;
//     }));
//   };

//   const removeFromCart = (id: number) => {
//     setCart(prev => prev.filter(i => i.ProductId !== id));
//   };

//   const clearCart = () => setCart([]);

//   return (
//     <HashRouter>
//       <div className="min-h-screen bg-slate-50 font-sans">
//         <Navbar user={user} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} onLogout={() => setUser(null)} />

//         <Routes>
//           <Route path="/" element={<Catalog user={user} addToCart={addToCart} />} />
//           <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} user={user} />} />
//           <Route path="/login" element={<Login setUser={setUser} />} />
//           <Route path="/register" element={<Login setUser={setUser} />} />

//           <Route path="/orders" element={user ? <Orders user={user} /> : <Navigate to="/login" />} />
//           <Route path="/orders/:id" element={user ? <OrderDetail user={user} /> : <Navigate to="/login" />} />
//           <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />

//           <Route path="/dashboard" element={
//             user && user.RoleId === Role.ADMIN ? <Dashboard /> : <Navigate to="/" />
//           } />
//         </Routes>

//         <AIChat />
//       </div>
//     </HashRouter>
//   );
// };

// export default App;

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AIChat from './components/AIChat';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { getCurrentUser, logoutUser } from './services/api';
import { User, CartItem, Product, Role } from './types';
import Register from './pages/Register';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('santeh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Check for persisted user session on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('santeh_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.ProductId === product.ProductId);
      if (existing) {
        return prev.map(i => i.ProductId === product.ProductId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.ProductId === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.ProductId !== id));
  };

  const clearCart = () => setCart([]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 font-sans">
        <Navbar user={user} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<Catalog user={user} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} user={user} />} />

          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />  // ← исправлено

          <Route path="/orders" element={user ? <Orders user={user} /> : <Navigate to="/login" />} />
          <Route path="/orders/:id" element={user ? <OrderDetail user={user} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />

          <Route path="/dashboard" element={
            user && user.RoleId === Role.ADMIN ? <Dashboard /> : <Navigate to="/" />
          } />
        </Routes>

        <AIChat />
      </div>
    </HashRouter>
  );
};

export default App;