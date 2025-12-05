import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, OrderItem, Comment, User, Role, OrderStatus, Product } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { ArrowLeft, Send, User as UserIcon, Phone, Mail, CheckCircle, X } from 'lucide-react';
import { getOrder, getComments, addComment, updateOrderStatus, getUser, getProduct } from '../services/api';

interface OrderDetailProps {
    user: User;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ user }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [customer, setCustomer] = useState<User | undefined>(undefined);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productLoading, setProductLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        refreshOrder();
    }, [id, user, navigate]);

    const refreshOrder = async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const orderId = parseInt(id);
            const foundOrder = await getOrder(orderId);
            
            // Security check for clients
            if (user.RoleId === Role.CLIENT && foundOrder.UserId !== user.UserId) {
                navigate('/');
                return;
            }
            
            setOrder(foundOrder);
            setItems(foundOrder.Items || []);
            
            // Load comments
            const orderComments = await getComments(orderId);
            setComments(orderComments);
            
            // Get customer details for employees/admins
            if (user.RoleId !== Role.CLIENT) {
                const customerData = await getUser(foundOrder.UserId);
                setCustomer(customerData);
            }
        } catch (err) {
            console.error('Error loading order:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке заказа');
        } finally {
            setLoading(false);
        }
    };

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
        if(!order) return;
        const newStatus = Number(e.target.value);
        try {
            await updateOrderStatus(order.OrderId, newStatus);
            await refreshOrder();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Ошибка при обновлении статуса');
        }
    };

    if (loading) return <div className="p-8 text-center">Загрузка...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!order) return <div className="p-8 text-center">Заказ не найден</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-gray-500 hover:text-cyan-600 mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-1" /> Назад к заказам
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Заказ #{order.OrderId}</h1>
                            {user.RoleId !== Role.CLIENT ? (
                                <select 
                                    value={order.StatusId}
                                    onChange={handleStatusChange}
                                    className={`px-3 py-1 rounded-lg text-sm font-bold border-0 cursor-pointer outline-none ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 bg-white text-gray-900`}
                                >
                                     {Object.entries(STATUS_LABELS).map(([id, label]) => (
                                        <option key={id} value={id}>{label}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_COLORS[order.StatusId]}`}>
                                    {STATUS_LABELS[order.StatusId]}
                                </span>
                            )}
                        </div>
                        <div className="mt-2 space-y-1">
                            <p className="text-gray-500 text-sm">Создан: {new Date(order.CreatedAt).toLocaleString()}</p>
                            <p className="text-sm">
                                <span className="text-gray-500">Заказчик: </span>
                                <span className="font-semibold text-gray-900">{order.UserName}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        {order.AssignedToName ? (
                            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 text-sm">
                                <UserIcon size={16} />
                                <span>Исполнитель: {order.AssignedToName}</span>
                            </div>
                        ) : user.RoleId === Role.EMPLOYEE && (
                            <button 
                                onClick={handleTakeOrder}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                <CheckCircle size={18} />
                                Взять в работу
                            </button>
                        )}
                    </div>
                </div>

                {/* Employee Info Block: Customer Contacts */}
                {(user.RoleId === Role.EMPLOYEE || user.RoleId === Role.ADMIN) && customer && (
                    <div className="px-6 py-4 bg-yellow-50 border-b border-gray-100 flex flex-wrap gap-6">
                        <div className="flex items-center gap-2 text-yellow-800">
                            <Phone size={18} />
                            <span className="font-medium">{customer.Phone || 'Телефон не указан'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-800">
                            <Mail size={18} />
                            <span className="font-medium">{customer.Email}</span>
                        </div>
                        <div className="text-xs text-yellow-700 italic ml-auto self-center">
                            Контактные данные для выполнения заказа
                        </div>
                    </div>
                )}
                
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Состав заказа</h3>
                    <div className="space-y-3">
                        {items.length === 0 ? (
                            <p className="text-gray-500 italic">Список товаров пуст (ошибка данных)</p>
                        ) : (
                            items.map(item => (
                                <div key={item.OrderItemId} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-lg">{item.ProductName || `Товар #${item.ProductId}`}</p>
                                        <div className="text-gray-500 mt-1 flex items-center gap-2">
                                            <span>{item.Price.toLocaleString()} ₽</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-900 font-medium">{item.Quantity} шт.</span>
                                        </div>
                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="font-bold text-gray-900 text-lg">
                                                            {(item.Price * item.Quantity).toLocaleString()} ₽
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                if (!item.ProductId) return;
                                                                setProductLoading(true);
                                                                try {
                                                                    const p = await getProduct(item.ProductId);
                                                                    setSelectedProduct(p);
                                                                } catch (err) {
                                                                    console.error('Error loading product:', err);
                                                                    alert('Ошибка при загрузке информации о товаре');
                                                                } finally {
                                                                    setProductLoading(false);
                                                                }
                                                            }}
                                                            disabled={productLoading}
                                                            className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50"
                                                        >
                                                            {productLoading ? 'Загрузка...' : 'Подробнее'}
                                                        </button>
                                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <div className="text-right">
                            <span className="text-gray-500 text-sm">Итого к оплате:</span>
                            <p className="text-3xl font-bold text-cyan-600">{order.TotalAmount.toLocaleString()} ₽</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Комментарии к заказу</h3>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto space-y-4">
                    {comments.length === 0 && <p className="text-gray-400 text-center italic">Нет комментариев</p>}
                    {comments.map(c => (
                        <div key={c.CommentId} className={`flex flex-col ${c.UserId === user.UserId ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                                c.UserId === user.UserId ? 'bg-cyan-50 text-cyan-900 rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                                <p className="text-sm font-bold text-xs opacity-75 mb-1">{c.UserName}</p>
                                <p>{c.Text}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{new Date(c.CreatedAt).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user.RoleId === Role.EMPLOYEE ? "Уточнения по наличию, сборке..." : "Напишите сообщение..."}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-gray-900"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                    />
                    <button 
                        onClick={handleSendComment}
                        className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.Name}</h2>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Product Image */}
                            {selectedProduct.ImageUrl && (
                                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img
                                        src={selectedProduct.ImageUrl}
                                        alt={selectedProduct.Name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EИзображение не доступно%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Description */}
                            {selectedProduct.Description && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Описание</h3>
                                    <p className="text-gray-700">{selectedProduct.Description}</p>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Category */}
                                {selectedProduct.Category && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Категория</p>
                                        <p className="text-gray-900 font-medium">{selectedProduct.Category}</p>
                                    </div>
                                )}

                                {/* Price */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Цена</p>
                                    <p className="text-gray-900 font-medium text-lg">{selectedProduct.Price.toLocaleString()} ₽</p>
                                </div>

                                {/* Stock */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Остаток</p>
                                    <p className={`font-medium ${selectedProduct.Stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedProduct.Stock > 0 ? `${selectedProduct.Stock} шт.` : 'Нет в наличии'}
                                    </p>
                                </div>

                                {/* Product ID */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-500 uppercase mb-1">ID товара</p>
                                    <p className="text-gray-900 font-medium">#{selectedProduct.ProductId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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