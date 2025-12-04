import React from 'react';
import { CartItem, User } from '../types';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { useNavigate } from 'react-router-dom';

interface CartProps {
    cart: CartItem[];
    updateQuantity: (id: number, delta: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    user: User | null;
}

const Cart: React.FC<CartProps> = ({ cart, updateQuantity, removeFromCart, clearCart, user }) => {
    const navigate = useNavigate();
    const total = cart.reduce((sum, item) => sum + (item.Price * item.quantity), 0);

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        StorageService.createOrder(user.UserId, cart.map(i => ({ product: i, quantity: i.quantity })));
        clearCart();
        alert('Заказ успешно создан!');
        navigate('/orders');
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Trash2 size={48} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Корзина пуста</h2>
                <p className="text-gray-500 mb-6">Перейдите в каталог чтобы выбрать товары</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                >
                    В каталог
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Корзина</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map(item => (
                        <div key={item.ProductId} className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                                <img src={`https://picsum.photos/200/200?random=${item.ProductId}`} className="w-full h-full object-cover rounded-lg" alt="" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{item.Name}</h3>
                                <p className="text-sm text-gray-500">{item.Category}</p>
                                <p className="font-bold text-cyan-600 mt-1">{item.Price} ₽</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button onClick={() => updateQuantity(item.ProductId, -1)} className="p-2 hover:bg-gray-50"><Minus size={14} /></button>
                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.ProductId, 1)} className="p-2 hover:bg-gray-50"><Plus size={14} /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.ProductId)} className="p-2 text-gray-400 hover:text-red-500">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit">
                    <h3 className="text-lg font-bold mb-4">Итого</h3>
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Товары ({cart.length})</span>
                        <span className="font-medium">{total.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex justify-between mb-6">
                        <span className="text-gray-500">Скидка</span>
                        <span className="font-medium text-green-600">0 ₽</span>
                    </div>
                    <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">К оплате</span>
                            <span className="text-2xl font-bold text-cyan-600">{total.toLocaleString()} ₽</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold hover:bg-cyan-700 flex items-center justify-center gap-2"
                    >
                        Оформить заказ <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;