import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, Comment, User, Role, OrderStatus, Product } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { ArrowLeft, Send, User as UserIcon, Phone, Mail, CheckCircle, X, Package, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { getOrder, getComments, addComment, updateOrderStatus, getUser, getProduct } from '../services/api';

interface OrderDetailProps {
    user: User;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ user }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [customer, setCustomer] = useState<User | undefined>(undefined);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productLoading, setProductLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) {
            setError('ID заказа не указан в URL');
            setLoading(false);
            return;
        }
        refreshOrder();
    }, [id]);

    const refreshOrder = async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const orderId = parseInt(id);
            if (isNaN(orderId)) throw new Error('Некорректный ID заказа');

            const foundOrder = await getOrder(orderId);

            if (user.RoleId === Role.CLIENT && foundOrder.UserId !== user.UserId) {
                navigate('/');
                return;
            }

            setOrder(foundOrder);

            if (user.RoleId !== Role.CLIENT) {
                try {
                    const customerData = await getUser(foundOrder.UserId);
                    setCustomer(customerData);
                } catch {}
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке заказа';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            if (!order) return;
            const data = await getComments(order.OrderId);
            console.log('COMMENTS:', data);
            setComments(data);
        };
        load();
    }, [order]);



    const handleSendComment = async () => {
        if (!newComment.trim() || !order) return;
        try {
            await addComment(order.OrderId, newComment);
            setNewComment('');
            await refreshOrder();
        } catch (err) {
            console.error('Error adding comment:', err);
            alert('Ошибка при добавлении комментария');
        }
    };

    const handleTakeOrder = async () => {
        if (!order) return;
        try {
            await updateOrderStatus(order.OrderId, OrderStatus.PROCESSING);
            await refreshOrder();
        } catch (err) {
            console.error('Error taking order:', err);
            alert('Ошибка при принятии заказа');
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!order) return;
        const newStatus = Number(e.target.value);
        try {
            await updateOrderStatus(order.OrderId, newStatus);
            await refreshOrder();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Ошибка при обновлении статуса');
        }
    };

    const handleViewProduct = async (productId: number) => {
        setProductLoading(true);
        try {
            const product = await getProduct(productId);
            setSelectedProduct(product);
        } catch (err) {
            console.error('Error loading product:', err);
            alert('Ошибка при загрузке информации о товаре');
        } finally {
            setProductLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка заказа...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-red-800 font-semibold mb-1">Ошибка загрузки</h3>
                        <p className="text-red-700">{error}</p>
                        <button 
                            onClick={() => navigate(-1)}
                            className="mt-4 text-red-600 hover:text-red-800 underline"
                        >
                            Вернуться назад
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!order) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Заказ не найден</h2>
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-cyan-600 hover:text-cyan-800 underline"
                    >
                        Вернуться к списку заказов
                    </button>
                </div>
            </div>
        );
    }

    const items = order.Items || [];

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-gray-600 hover:text-cyan-600 mb-6 transition-colors font-medium"
            >
                <ArrowLeft size={20} className="mr-2" /> Назад к заказам
            </button>

            {/* Main Order Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-3xl font-bold text-gray-900">Заказ #{order.OrderId}</h1>
                                {user.RoleId !== Role.CLIENT ? (
                                    <select 
                                        value={order.StatusId}
                                        onChange={handleStatusChange}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold border-2 border-gray-300 cursor-pointer outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-900 transition-all"
                                    >
                                        {Object.entries(STATUS_LABELS).map(([id, label]) => (
                                            <option key={id} value={id}>{label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${STATUS_COLORS[order.StatusId]}`}>
                                        {STATUS_LABELS[order.StatusId]}
                                    </span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span className="font-medium">Создан:</span>
                                    <span>{new Date(order.CreatedAt).toLocaleString('ru-RU')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <UserIcon size={16} className="text-gray-500" />
                                    <span className="font-medium">Заказчик:</span>
                                    <span className="font-semibold">{order.UserName}</span>
                                </div>
                                {order.UpdatedAt && order.UpdatedAt !== order.CreatedAt && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span className="font-medium">Обновлен:</span>
                                        <span>{new Date(order.UpdatedAt).toLocaleString('ru-RU')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Executor Info / Take Order Button */}
                        <div className="flex flex-col gap-2">
                            {order.AssignedToName ? (
                                <div className="flex items-center gap-3 bg-blue-100 px-5 py-3 rounded-lg border border-blue-200">
                                    <UserIcon size={20} className="text-blue-700" />
                                    <div>
                                        <p className="text-xs text-blue-600 font-medium">Исполнитель</p>
                                        <p className="text-sm font-semibold text-blue-900">{order.AssignedToName}</p>
                                    </div>
                                </div>
                            ) : user.RoleId === Role.EMPLOYEE && order.StatusId === OrderStatus.CREATED && (
                                <button 
                                    onClick={handleTakeOrder}
                                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium"
                                >
                                    <CheckCircle size={20} />
                                    Взять в работу
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Contact Info (for employees/admins) */}
                {(user.RoleId === Role.EMPLOYEE || user.RoleId === Role.ADMIN) && customer && (
                    <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
                        <div className="flex flex-wrap items-center gap-6">
                            <h3 className="text-sm font-semibold text-amber-900 uppercase">Контактная информация:</h3>
                            {customer.Phone && (
                                <div className="flex items-center gap-2 text-amber-900">
                                    <Phone size={18} className="text-amber-700" />
                                    <a href={`tel:${customer.Phone}`} className="font-medium hover:underline">
                                        {customer.Phone}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-amber-900">
                                <Mail size={18} className="text-amber-700" />
                                <a href={`mailto:${customer.Email}`} className="font-medium hover:underline">
                                    {customer.Email}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Order Items */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Package size={22} className="text-gray-700" />
                        <h3 className="text-xl font-bold text-gray-900">Состав заказа</h3>
                        <span className="text-sm text-gray-500 ml-auto">
                            {items.length} {items.length === 1 ? 'позиция' : items.length < 5 ? 'позиции' : 'позиций'}
                        </span>
                    </div>
                    
                    <div className="space-y-2">
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
                                <Package size={32} className="mx-auto mb-2 text-gray-400" />
                                <p>Список товаров пуст</p>
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div 
                                    key={item.OrderItemId} 
                                    className="flex justify-between items-center py-4 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="bg-cyan-100 text-cyan-700 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-lg truncate">
                                                {item.ProductName || `Товар #${item.ProductId}`}
                                            </p>
                                            <div className="text-gray-600 mt-1 flex items-center gap-3 text-sm flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <DollarSign size={14} />
                                                    {item.Price.toLocaleString()} ₽
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="font-medium text-gray-900">
                                                    {item.Quantity} шт.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">Сумма</p>
                                            <p className="font-bold text-gray-900 text-xl whitespace-nowrap">
                                                {(item.Price * item.Quantity).toLocaleString()} ₽
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Total Amount */}
                    {items.length > 0 && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-200 flex justify-end">
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 px-8 py-4 rounded-xl border border-cyan-200">
                                <p className="text-sm text-gray-600 mb-1">Итого к оплате</p>
                                <p className="text-4xl font-bold text-cyan-700">
                                    {order.TotalAmount.toLocaleString()} ₽
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 text-lg">Комментарии к заказу</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Обсудите детали заказа с {user.RoleId === Role.CLIENT ? 'сотрудником' : 'заказчиком'}
                    </p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto space-y-4 bg-gray-50">
                    {comments.length === 0 ? (
                        <div className="text-center py-8">
                            <Send size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500 italic">Пока нет комментариев</p>
                            <p className="text-sm text-gray-400 mt-1">Начните обсуждение заказа</p>
                        </div>
                    ) : (
comments.map(c => (
    <div 
        key={c.commentId} 
        className={`flex flex-col ${c.userId === user.UserId ? 'items-end' : 'items-start'}`}
    >
        <div 
            className={`max-w-[75%] rounded-xl p-4 shadow-sm ${
                c.userId === user.UserId
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
            }`}
        >
            <p 
                className={`text-xs font-bold mb-2 ${
                    c.userId === user.UserId ? 'text-cyan-100' : 'text-gray-500'
                }`}
            >
                {c.userName}
            </p>

            <p className="leading-relaxed">{c.text}</p>
        </div>

        <span className="text-xs text-gray-400 mt-1 px-2">
            {new Date(c.createdAt).toLocaleString('ru-RU')}
        </span>
    </div>
))

                    )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user.RoleId === Role.EMPLOYEE ? "Уточнения по наличию, сборке..." : "Напишите сообщение..."}
                        className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-900"
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                    />
                    <button 
                        onClick={handleSendComment}
                        disabled={!newComment.trim()}
                        className="bg-cyan-600 text-white px-5 py-3 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white z-10 flex justify-between items-start p-6 border-b border-gray-200">
                            <div className="flex-1 min-w-0 pr-4">
                                <h2 className="text-2xl font-bold text-gray-900 truncate">{selectedProduct.Name}</h2>
                                <p className="text-sm text-gray-500 mt-1">ID: #{selectedProduct.ProductId}</p>
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors flex-shrink-0"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Product Image */}
                            {selectedProduct.ImageUrl && (
                                <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                                    <img
                                        src={selectedProduct.ImageUrl}
                                        alt={selectedProduct.Name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="18" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EИзображение недоступно%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Price & Stock Highlight */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-200">
                                    <p className="text-sm font-semibold text-cyan-700 uppercase mb-2">Цена</p>
                                    <p className="text-3xl font-bold text-cyan-900">{selectedProduct.Price.toLocaleString()} ₽</p>
                                </div>
                                <div className={`p-5 rounded-xl border ${selectedProduct.Stock > 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
                                    <p className={`text-sm font-semibold uppercase mb-2 ${selectedProduct.Stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        Наличие
                                    </p>
                                    <p className={`text-2xl font-bold ${selectedProduct.Stock > 0 ? 'text-green-900' : 'text-red-900'}`}>
                                        {selectedProduct.Stock > 0 ? `${selectedProduct.Stock} шт.` : 'Нет в наличии'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedProduct.Description && (
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Описание</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedProduct.Description}</p>
                                </div>
                            )}

                            {/* Category */}
                            {selectedProduct.Category && (
                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Категория</h3>
                                    <p className="text-gray-900 font-medium text-lg">{selectedProduct.Category}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;