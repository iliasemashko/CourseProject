import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User as UserIcon, Settings, Package, LayoutDashboard } from 'lucide-react';
import { User, Role } from '../types';
import { StorageService } from '../services/storageService';

interface NavbarProps {
  user: User | null;
  cartCount: number;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, cartCount, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    StorageService.logout();
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-cyan-600 p-1.5 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">SantehOrders</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-cyan-500 hover:text-cyan-600 text-sm font-medium transition-colors">
                Каталог
              </Link>
              {user && (
                <Link to="/orders" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-cyan-500 hover:text-cyan-600 text-sm font-medium transition-colors">
                  {user.RoleId === Role.CLIENT ? 'Мои заказы' : 'Заказы'}
                </Link>
              )}
               {(user?.RoleId === Role.ADMIN) && (
                <Link to="/dashboard" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-cyan-500 hover:text-cyan-600 text-sm font-medium transition-colors">
                  Админ-панель
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && user.RoleId === Role.CLIENT && (
              <Link to="/cart" className="relative p-2 text-gray-500 hover:text-cyan-600 transition-colors">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{user.FullName}</span>
                  <span className="text-xs text-gray-500">{user.RoleId === Role.ADMIN ? 'Администратор' : user.RoleId === Role.EMPLOYEE ? 'Сотрудник' : 'Клиент'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/profile" title="Профиль" className="p-2 text-gray-400 hover:text-gray-600">
                            <UserIcon size={20} />
                    </Link>
                    <button onClick={handleLogout} title="Выйти" className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <LogOut size={20} />
                    </button>
                </div>
              </div>
            ) : (
                <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/login')}
                      className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Вход
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="bg-cyan-600 text-white hover:bg-cyan-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      Регистрация
                    </button>
                  </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;