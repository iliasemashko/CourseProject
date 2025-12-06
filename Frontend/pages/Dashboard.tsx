import React, { useEffect, useState, useRef } from 'react';
import { User, OrderStatus, Role, Order } from '../types';
import { getOrders, getUsers, createUser, deleteUser } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingBag, DollarSign, Plus, FileText, Upload, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import RobotoTTF from '../fonts/Roboto-VariableFont_wdth,wght.ttf';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        chartData: [] as any[]
    });
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ 
        FullName: '', 
        Email: '', 
        Password: '', 
        RoleId: Role.CLIENT 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [fetchedOrders, fetchedUsers] = await Promise.all([
                getOrders(),
                getUsers()
            ]);
            
            setOrders(fetchedOrders);
            setUsers(fetchedUsers);
            
            // Подсчет общей выручки только из выполненных заказов
            const totalRevenue = fetchedOrders.reduce((sum, o) => 
                sum + (o.StatusId === OrderStatus.COMPLETED ? o.TotalAmount : 0), 0
            );
            
            // Подсчет заказов по статусам
            const statusCounts = fetchedOrders.reduce((acc, o) => {
                const statusName = getStatusShortName(o.StatusId);
                acc[statusName] = (acc[statusName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const chartData = Object.keys(statusCounts).map(key => ({
                name: key,
                count: statusCounts[key]
            }));

            setStats({
                totalOrders: fetchedOrders.length,
                totalRevenue,
                totalUsers: fetchedUsers.length,
                chartData
            });
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setError('Не удалось загрузить данные. Убедитесь, что вы авторизованы.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const getStatusShortName = (statusId: number): string => {
        switch (statusId) {
            case OrderStatus.CREATED: return 'Создан';
            case OrderStatus.PROCESSING: return 'В обработке';
            case OrderStatus.COMPLETED: return 'Выполнен';
            case OrderStatus.CANCELLED: return 'Отменен';
            default: return 'Неизвестно';
        }
    };

    const getStatusName = (statusId: number): string => {
        switch (statusId) {
            case OrderStatus.CREATED: return 'Создан';
            case OrderStatus.PROCESSING: return 'В обработке';
            case OrderStatus.COMPLETED: return 'Выполнен';
            case OrderStatus.CANCELLED: return 'Отменён';
            default: return 'Неизвестно';
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.FullName || !newUser.Email || !newUser.Password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        setLoading(true);
        try {
            await createUser({
                FullName: newUser.FullName,
                Email: newUser.Email,
                Password: newUser.Password,
                RoleId: newUser.RoleId
            });
            
            setIsUserModalOpen(false);
            setNewUser({ FullName: '', Email: '', Password: '', RoleId: Role.CLIENT });
            await refreshData();
            alert('Пользователь успешно создан');
        } catch (error: any) {
            console.error('Ошибка создания пользователя:', error);
            alert('Ошибка создания пользователя: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        setLoading(true);
        try {
            await deleteUser(userId);
            await refreshData();
            alert('Пользователь успешно удален');
        } catch (error: any) {
            console.error('Ошибка удаления пользователя:', error);
            alert('Ошибка удаления пользователя: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        const doc = new jsPDF();

        const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        };

        try {
            const fontData = await fetch(RobotoTTF).then(res => res.arrayBuffer());
            const fontBase64 = arrayBufferToBase64(fontData);
            doc.addFileToVFS('Roboto.ttf', fontBase64);
            doc.addFont('Roboto.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto', 'normal');
        } catch (error) {
            console.error('Ошибка загрузки шрифта, используем стандартный', error);
            doc.setFont('helvetica', 'normal');
        }

        doc.setFontSize(20);
        doc.text('SantehOrders - System Report', 14, 22);

        doc.setFontSize(12);
        const currentDate = new Date().toLocaleString('ru-RU');
        doc.text(`Дата генерации: ${currentDate}`, 14, 32);
        doc.text(`Общая выручка: ${stats.totalRevenue.toLocaleString('ru-RU')} ₽`, 14, 40);
        doc.text(`Всего заказов: ${stats.totalOrders}`, 14, 48);
        doc.text(`Всего пользователей: ${stats.totalUsers}`, 14, 56);

        const tableData = orders.map(o => [
            o.OrderId.toString(),
            new Date(o.CreatedAt).toLocaleDateString('ru-RU'),
            o.UserName || `User ${o.UserId}`,
            o.TotalAmount.toLocaleString('ru-RU') + ' ₽',
            getStatusName(o.StatusId)
        ]);

        autoTable(doc, {
            head: [['ID', 'Date', 'Client', 'Earnings', 'Статус']],
            body: tableData,
            startY: 66,
            styles: {
                font: 'Roboto',
                fontSize: 10,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                font: 'helvetica',
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240],
            },
        });

        doc.save(`system_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                
                if (!json.users && !json.products && !json.orders) {
                    alert('Ошибка структуры данных. JSON должен содержать users, products или orders.');
                    return;
                }

                alert('Функция импорта требует дополнительной реализации на бэкенде');
                
            } catch (error) {
                alert('Ошибка чтения файла: ' + error);
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const getRoleName = (roleId: number): string => {
        switch (roleId) {
            case Role.CLIENT: return 'Клиент';
            case Role.EMPLOYEE: return 'Сотрудник';
            case Role.ADMIN: return 'Администратор';
            default: return 'Неизвестно';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
                
                <div className="flex gap-3">
                    <button 
                        onClick={handleExportPDF}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FileText size={18} /> Экспорт отчета (PDF)
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload size={18} /> Импорт БД (JSON)
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImportJSON} 
                        className="hidden" 
                        accept=".json" 
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Всего заказов</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Выручка (Выполнено)</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} ₽</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Пользователи</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-6">Статистика заказов</h3>
                    <div className="h-64">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-gray-400">Загрузка...</div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* User Management */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Управление пользователями</h3>
                        <button 
                            onClick={() => setIsUserModalOpen(true)}
                            disabled={loading}
                            className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 max-h-[300px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-gray-400">Загрузка...</div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-gray-400">Нет пользователей</div>
                            </div>
                        ) : (
                            users.map(u => (
                                <div key={u.UserId} className="flex justify-between items-center py-3 border-b last:border-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{u.FullName}</p>
                                        </div>
                                        <p className="text-xs text-gray-400">{u.Email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {getRoleName(u.RoleId)}
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteUser(u.UserId)}
                                            disabled={loading}
                                            className="p-1 rounded-full border hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Удалить пользователя"
                                        >
                                            <Trash2 size={14} className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">Добавить пользователя</h3>
                        <div className="space-y-4">
                            <input 
                                className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                                placeholder="ФИО"
                                value={newUser.FullName}
                                onChange={e => setNewUser({...newUser, FullName: e.target.value})}
                            />
                            <input 
                                type="email"
                                className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                                placeholder="Email"
                                value={newUser.Email}
                                onChange={e => setNewUser({...newUser, Email: e.target.value})}
                            />
                            <input 
                                type="password"
                                className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                                placeholder="Пароль"
                                value={newUser.Password}
                                onChange={e => setNewUser({...newUser, Password: e.target.value})}
                            />
                            <select 
                                className="w-full border rounded-lg p-2 bg-white text-gray-900"
                                value={newUser.RoleId}
                                onChange={e => setNewUser({...newUser, RoleId: Number(e.target.value)})}
                            >
                                <option value={Role.CLIENT}>Клиент</option>
                                <option value={Role.EMPLOYEE}>Сотрудник</option>
                                <option value={Role.ADMIN}>Администратор</option>
                            </select>
                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    onClick={() => setIsUserModalOpen(false)} 
                                    disabled={loading}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Отмена
                                </button>
                                <button 
                                    onClick={handleCreateUser} 
                                    disabled={loading}
                                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Создание...' : 'Создать'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;