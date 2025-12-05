import React, { useEffect, useState, useRef } from 'react';
import { User, OrderStatus, Role } from '../types';
import { StorageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingBag, DollarSign, Lock, Unlock, Plus, FileText, Upload, ShoppingCart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ FullName: '', Email: '', PasswordHash: '', RoleId: Role.CLIENT });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshData = () => {
        const orders = StorageService.getOrders();
        const allUsers = StorageService.getAllUsers();
        setUsers(allUsers);
        
        const totalRevenue = orders.reduce((sum, o) => sum + (o.StatusId === OrderStatus.COMPLETED ? o.TotalAmount : 0), 0);
        
        const statusCounts = orders.reduce((acc, o) => {
            const statusName = o.StatusId === 1 ? 'New' : o.StatusId === 2 ? 'Proc' : o.StatusId === 3 ? 'Done' : 'Canc';
            acc[statusName] = (acc[statusName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.keys(statusCounts).map(key => ({
            name: key,
            count: statusCounts[key]
        }));

        setStats({
            totalOrders: orders.length,
            totalRevenue,
            totalUsers: allUsers.length,
            chartData
        });
    };

    useEffect(() => {
        refreshData();
    }, []);

    const toggleBlock = (id: number) => {
        StorageService.toggleUserBlock(id);
        refreshData();
    };

    const handleCreateUser = () => {
        if (newUser.FullName && newUser.Email && newUser.PasswordHash) {
            StorageService.register(newUser);
            setIsUserModalOpen(false);
            setNewUser({ FullName: '', Email: '', PasswordHash: '', RoleId: Role.CLIENT });
            refreshData();
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('SantehOrders - System Report', 14, 22);
        
        // Stats
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
        doc.text(`Total Revenue: ${stats.totalRevenue.toLocaleString()} RUB`, 14, 40);
        doc.text(`Total Orders: ${stats.totalOrders}`, 14, 48);
        doc.text(`Total Users: ${stats.totalUsers}`, 14, 56);

        // Users Table
        const userRows = users.map(u => [
            u.UserId, 
            u.FullName, 
            u.Email, 
            u.RoleId === 1 ? 'Client' : u.RoleId === 2 ? 'Employee' : 'Admin', 
            u.IsBlocked ? 'Blocked' : 'Active'
        ]);

        autoTable(doc, {
            startY: 65,
            head: [['ID', 'Name', 'Email', 'Role', 'Status']],
            body: userRows,
        });

        doc.save('system_report.pdf');
    };

    const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (StorageService.importData(json)) {
                    alert('Данные успешно импортированы!');
                    refreshData();
                } else {
                    alert('Ошибка структуры данных. Убедитесь, что JSON файл содержит корректные массивы (users, products, orders).');
                }
            } catch (error) {
                alert('Ошибка чтения файла: ' + error);
            }
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 text-sm font-medium transition-colors"
                    >
                        <ShoppingCart size={18} /> Корзина
                    </button>
                    <button 
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        <FileText size={18} /> Экспорт отчета системы (PDF)
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        <Upload size={18} /> Импорт базы данных (JSON)
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
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Management */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Управление пользователями</h3>
                        <button 
                            onClick={() => setIsUserModalOpen(true)}
                            className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700"
                            title="Добавить пользователя"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 max-h-[300px]">
                        {users.map(u => (
                            <div key={u.UserId} className={`flex justify-between items-center py-3 border-b last:border-0 ${u.IsBlocked ? 'opacity-50' : ''}`}>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{u.FullName}</p>
                                        {u.IsBlocked && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">Blocked</span>}
                                    </div>
                                    <p className="text-xs text-gray-400">{u.Email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {u.RoleId === Role.CLIENT ? 'Клиент' : u.RoleId === Role.EMPLOYEE ? 'Сотрудник' : 'Админ'}
                                    </span>
                                    {u.RoleId !== Role.ADMIN && (
                                        <button 
                                            onClick={() => toggleBlock(u.UserId)}
                                            className={`p-1 rounded ${u.IsBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                                            title={u.IsBlocked ? "Разблокировать" : "Заблокировать"}
                                        >
                                            {u.IsBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
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
                                className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                                placeholder="Email"
                                value={newUser.Email}
                                onChange={e => setNewUser({...newUser, Email: e.target.value})}
                            />
                            <input 
                                type="password"
                                className="w-full border rounded-lg p-2 bg-white text-gray-900" 
                                placeholder="Пароль"
                                value={newUser.PasswordHash}
                                onChange={e => setNewUser({...newUser, PasswordHash: e.target.value})}
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
                                <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-600">Отмена</button>
                                <button onClick={handleCreateUser} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">Создать</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;