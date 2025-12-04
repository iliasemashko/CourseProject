import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, Role, User } from '../types';
import { StorageService } from '../services/storageService';
import { Search, Filter, Plus, ShoppingCart, Trash2 } from 'lucide-react';

// Картинка по умолчанию (если у товара нет ImageUrl)
const defaultImage = 'https://via.placeholder.com/400x400?text=No+Image';

interface CatalogProps {
  user: User | null;
  addToCart: (p: Product) => void;
}

const Catalog: React.FC<CatalogProps> = ({ user, addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  
  // Admin Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setProducts(StorageService.getProducts());
  }, []);

  const categories = ['Все', ...Array.from(new Set(products.map(p => p.Category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.Name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || p.Category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = () => {
    if (!editingProduct.Name || !editingProduct.Price) return;
    StorageService.saveProduct(editingProduct as Product);
    setProducts(StorageService.getProducts());
    setIsEditMode(false);
    setEditingProduct({});
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Вы уверены?')) {
      StorageService.deleteProduct(id);
      setProducts(StorageService.getProducts());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Каталог сантехники</h1>
          <p className="text-gray-500 mt-1">Все для ванной и кухни</p>
        </div>
        
        {user?.RoleId === Role.ADMIN && (
          <button 
            onClick={() => { setEditingProduct({}); setIsEditMode(true); }}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} /> Добавить товар
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Поиск товаров..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none bg-white text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter size={20} className="text-gray-400 min-w-[20px]" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-cyan-100 text-cyan-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.ProductId} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
              <img 
                src={product.ImageUrl || defaultImage} 
                alt={product.Name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-gray-700">
                {product.Category}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.Name}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.Description}</p>
              
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{product.Price.toLocaleString()} ₽</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {product.Stock > 0 ? (
                      <span className="text-green-600">В наличии: {product.Stock} шт.</span>
                    ) : (
                      <span className="text-red-500">Нет в наличии</span>
                    )}
                  </div>
                </div>

                {user?.RoleId === Role.ADMIN ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingProduct(product); setIsEditMode(true); }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.ProductId)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      if (!user) {
                        setShowAuthModal(true);
                      } else {
                        addToCart(product);
                      }
                    }}
                    disabled={product.Stock === 0}
                    className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShoppingCart size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingProduct.ProductId ? 'Редактировать' : 'Новый товар'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input 
                  className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                  value={editingProduct.Name || ''} 
                  onChange={e => setEditingProduct({...editingProduct, Name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                  <input 
                    type="number"
                    className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                    value={editingProduct.Price || ''} 
                    onChange={e => setEditingProduct({...editingProduct, Price: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
                  <input 
                    type="number"
                    className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                    value={editingProduct.Stock || ''} 
                    onChange={e => setEditingProduct({...editingProduct, Stock: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <input 
                  className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                  value={editingProduct.Category || ''} 
                  onChange={e => setEditingProduct({...editingProduct, Category: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea 
                  className="w-full border rounded-lg p-2 h-24 bg-white text-gray-900" 
                  value={editingProduct.Description || ''} 
                  onChange={e => setEditingProduct({...editingProduct, Description: e.target.value})} 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditMode(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Отмена</button>
              <button onClick={handleSaveProduct} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Requirement Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Требуется авторизация</h2>
            <p className="text-gray-600 mb-6">
              Чтобы добавить товары в корзину и оформить заказ, пожалуйста, зарегистрируйтесь или войдите в систему.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <Link 
                to="/register"
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Регистрация
              </Link>
              <Link 
                to="/login"
                className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Войти
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;