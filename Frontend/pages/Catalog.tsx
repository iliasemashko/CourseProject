import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, Role, User, CartItem } from '../types';
import { Search, Filter, Plus, ShoppingCart, Trash2, Edit } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

// Картинка по умолчанию (если у товара нет ImageUrl)
const defaultImage = '/assets/product1.jpg';

interface CatalogProps {
  user: User | null;
  addToCart: (item: CartItem | Product) => void;
}

const Catalog: React.FC<CatalogProps> = ({ user, addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Загрузка продуктов с API
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      console.log('Loaded products in Catalog:', data);
      setProducts(data);
    } catch (err) {
      console.error('Ошибка загрузки продуктов:', err);
      setError('Не удалось загрузить продукты. Проверьте, что сервер запущен на http://localhost:5114');
      
      // Временные тестовые данные для разработки
      setProducts([
        {
          ProductId: 1,
          Name: 'Смеситель для ванной',
          Description: 'Современный хромированный смеситель',
          Price: 5000,
          Category: 'Смесители',
          Stock: 10,
          CreatedAt: new Date().toISOString(),
        },
        {
          ProductId: 2,
          Name: 'Раковина керамическая',
          Description: 'Белая керамическая раковина 60см',
          Price: 3500,
          Category: 'Раковины',
          Stock: 5,
          CreatedAt: new Date().toISOString(),
        },
        {
          ProductId: 3,
          Name: 'Унитаз напольный',
          Description: 'Унитаз с микролифтом',
          Price: 8000,
          Category: 'Унитазы',
          Stock: 3,
          CreatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = ['Все', ...Array.from(new Set(products.map(p => p.Category).filter(Boolean)))];

const filteredProducts = products.filter(p => {
  const name = p.Name || '';
  const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory === 'Все' || p.Category === selectedCategory;
  return matchesSearch && matchesCategory;
});


  const handleSaveProduct = async () => {
    if (!editingProduct.Name || !editingProduct.Price) {
      alert('Заполните название и цену');
      return;
    }

    try {
      if (editingProduct.ProductId) {
        // Обновление существующего продукта
        await updateProduct(editingProduct.ProductId, {
          Name: editingProduct.Name,
          Price: editingProduct.Price,
          Description: editingProduct.Description || '',
          Category: editingProduct.Category || '',
          Stock: editingProduct.Stock || 0,
        });
      } else {
        // Создание нового продукта
        await createProduct({
          Name: editingProduct.Name,
          Price: editingProduct.Price,
          Description: editingProduct.Description || '',
          Category: editingProduct.Category || '',
          Stock: editingProduct.Stock || 0,
        });
      }
      await loadProducts();
      setIsEditMode(false);
      setEditingProduct({});
    } catch (err) {
      console.error('Ошибка сохранения продукта:', err);
      alert('Не удалось сохранить продукт');
    }
  };

  // Удаление продукта
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error('Ошибка удаления продукта:', err);
      alert('Не удалось удалить продукт');
    }
  };

  // Добавление в корзину - конвертируем Product в CartItem
  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  // Получить URL изображения продукта
  const getImageUrl = (product: Product) => {
    // Если сервер отдаёт полный URL в ImageUrl — используем его
    if (product.ImageUrl) {
      if (product.ImageUrl.startsWith('http') || product.ImageUrl.startsWith('data:')) {
        return product.ImageUrl;
      }
      // Если в ImageUrl хранится относительный путь или имя файла, попробуем получить изображение по API
      if (product.ProductId) return `http://localhost:5114/api/products/${product.ProductId}/image`;
      return defaultImage;
    }

    // Если бекенд хранит/отдаёт бинарные данные в поле Image — используем эндпоинт по id
    if (product.ProductId) return `http://localhost:5114/api/products/${product.ProductId}/image`;

    return defaultImage;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadProducts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Каталог сантехники</h1>
          <p className="text-gray-500 mt-1">Все для ванной и кухни</p>
        </div>
        
        {(user?.RoleId === Role.ADMIN || user?.RoleId === Role.EMPLOYEE) && (
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
      {filteredProducts.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-500 text-lg">Товары не найдены</p>
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {filteredProducts.map((product, index) => {
      const price = product.Price ?? 0;
      const stock = product.Stock ?? 0;
      const name = product.Name || 'Без названия';
      const description = product.Description || 'Описание отсутствует';
      const imageUrl = getImageUrl(product);
      const category = product.Category;

      return (
        <div key={product.ProductId ? `product-${product.ProductId}` : `product-${index}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
          <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = defaultImage; }}
            />
            {category && (
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-gray-700">
                {category}
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{description}</p>
            <div className="flex items-end justify-between mt-auto">
              <div>
                <span className="text-2xl font-bold text-gray-900">{price.toLocaleString()} ₽</span>
                <div className="text-xs text-gray-500 mt-1">
                  {stock > 0 ? (
                    <span className="text-green-600">В наличии: {stock} шт.</span>
                  ) : (
                    <span className="text-red-500">Нет в наличии</span>
                  )}
                </div>
              </div>
              {user ? (
  (user.RoleId === Role.ADMIN || user.RoleId === Role.EMPLOYEE) ? (
    <div className="flex gap-2">
      <button 
        onClick={() => { setEditingProduct(product); setIsEditMode(true); }}
        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        title="Редактировать"
      >
        <Edit size={18} />
      </button>
      <button 
        onClick={() => handleDeleteProduct(product.ProductId)}
        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        title="Удалить"
      >
        <Trash2 size={18} />
      </button>
    </div>
  ) : (
    <button 
      onClick={() => handleAddToCart(product)}
      disabled={stock === 0}
      className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      title="Добавить в корзину"
    >
      <ShoppingCart size={20} />
    </button>
  )
) : (
  <button 
    onClick={() => setShowAuthModal(true)}
    className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700 transition-colors"
  >
    <ShoppingCart size={20} />
  </button>
)}
            </div>
          </div>
        </div>
      )
    })}
  </div>
)}


      {/* Admin Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct.ProductId ? 'Редактировать товар' : 'Новый товар'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input 
                  className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                  value={editingProduct.Name || ''} 
                  onChange={e => setEditingProduct({...editingProduct, Name: e.target.value})} 
                  placeholder="Например, Смеситель для ванной"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽) *</label>
                  <input 
                    type="number"
                    className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                    value={editingProduct.Price || ''} 
                    onChange={e => setEditingProduct({...editingProduct, Price: Number(e.target.value)})} 
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
                  <input 
                    type="number"
                    className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                    value={editingProduct.Stock || ''} 
                    onChange={e => setEditingProduct({...editingProduct, Stock: Number(e.target.value)})} 
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <input 
                  className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                  value={editingProduct.Category || ''} 
                  onChange={e => setEditingProduct({...editingProduct, Category: e.target.value})} 
                  placeholder="Например, Смесители"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea 
                  className="w-full border rounded-lg p-2 h-24 bg-white text-gray-900" 
                  value={editingProduct.Description || ''} 
                  onChange={e => setEditingProduct({...editingProduct, Description: e.target.value})} 
                  placeholder="Краткое описание товара"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => { setIsEditMode(false); setEditingProduct({}); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={handleSaveProduct} 
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Сохранить
              </button>
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