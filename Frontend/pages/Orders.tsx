import React, { useState, useEffect } from 'react';
import { User, Order, Role, OrderStatus } from '../types';
import { StorageService } from '../services/storageService';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { FileText, Eye, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

interface OrdersProps {
  user: User;
}

const Orders: React.FC<OrdersProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // View mode for employees: 'assigned' (My Work), 'new' (Available), 'all' (All)
  const [viewMode, setViewMode] = useState<'all' | 'assigned' | 'new'>('assigned'); 
  const navigate = useNavigate();

  useEffect(() => {
    refreshOrders();
    if (user.RoleId === Role.ADMIN) {
        setEmployees(StorageService.getAllUsers().filter(u => u.RoleId === Role.EMPLOYEE));
    }
  }, [user]);

  const refreshOrders = () => {
      const allOrders = StorageService.getOrders();
      if (user.RoleId === Role.CLIENT) {
        setOrders(allOrders.filter(o => o.UserId === user.UserId));
      } else {
        setOrders(allOrders);
      }
  };

  const getDisplayedOrders = () => {
      let result = orders;
      
      // Filter by status dropdown
      if (statusFilter !== 'all') {
          result = result.filter(o => o.StatusId === Number(statusFilter));
      }

      // Filter by Role/Tab logic
      if (user.RoleId === Role.EMPLOYEE) {
          if (viewMode === 'assigned') {
             // "My Work": Orders assigned to this user
             result = result.filter(o => o.AssignedToUserId === user.UserId);
          } else if (viewMode === 'new') {
             // "New Orders": Unassigned orders, generally in CREATED status
             result = result.filter(o => !o.AssignedToUserId && o.StatusId === OrderStatus.CREATED);
          }
          // 'all' shows everything
      }

      return result;
  };

  const filteredOrders = getDisplayedOrders();

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Order Report - SantehOrders', 14, 22);
    
    const tableData = filteredOrders.map(o => [
        o.OrderId,
        o.CreatedAt.split('T')[0],
        o.UserName,
        o.TotalAmount + ' RUB',
        STATUS_LABELS[o.StatusId],
        o.AssignedToName || 'Unassigned'
    ]);

    autoTable(doc, {
        head: [['ID', 'Date', 'Customer', 'Total', 'Status', 'Assigned To']],
        body: tableData,
        startY: 30,
    });

    doc.save('orders_report.pdf');
  };

  const handleStatusChange = (orderId: number, newStatusStr: string) => {
      const newStatus = Number(newStatusStr);

      // Auto-move logic for Employees
      if (user.RoleId === Role.EMPLOYEE) {
          if (newStatus === OrderStatus.CREATED) {
              // If moving back to "Created", unassign the order so it goes to "New Orders" tab
              StorageService.assignOrder(orderId, 0); 
          } else {
              // If moving to any "active" status, ensure it's assigned to the current user
              StorageService.assignOrder(orderId, user.UserId);
          }
      }

      StorageService.updateOrderStatus(orderId, newStatus);
      refreshOrders();
  };

  const handleAssignChange = (orderId: number, employeeId: string) => {
      StorageService.assignOrder(orderId, Number(employeeId));
      refreshOrders();
  };

  const takeOrder = (orderId: number) => {
      StorageService.assignOrder(orderId, user.UserId);
      StorageService.updateOrderStatus(orderId, OrderStatus.PROCESSING);
      refreshOrders();
      setViewMode('assigned'); // Switch to "My Work" tab
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
            {user.RoleId === Role.CLIENT ? 'Мои заказы' : 'Управление заказами'}
            </h1>
            {user.RoleId === Role.EMPLOYEE && (
                <div className="flex gap-2 mt-4">
                    <button 
                        onClick={() => setViewMode('assigned')}
                        className={`text-sm px-4 py-2 rounded-lg transition-colors border ${viewMode === 'assigned' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                        Мои задачи
                    </button>
                    <button 
                         onClick={() => setViewMode('new')}
                         className={`text-sm px-4 py-2 rounded-lg transition-colors border ${viewMode === 'new' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                        Новые заказы
                    </button>
                    <button 
                         onClick={() => setViewMode('all')}
                         className={`text-sm px-4 py-2 rounded-lg transition-colors border ${viewMode === 'all' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                        Все заказы
                    </button>
                </div>
            )}
        </div>

        <div className="flex gap-3">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-gray-900"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Все статусы</option>
            {Object.entries(STATUS_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <FileText size={16} /> Экспорт PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                {user.RoleId !== Role.CLIENT && (
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                {user.RoleId === Role.ADMIN && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Исполнитель</th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                  <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Заказов не найдено</td>
                  </tr>
              ) : (
                filteredOrders.map((order) => (
                    <tr key={order.OrderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.OrderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.CreatedAt).toLocaleDateString()}
                    </td>
                    {user.RoleId !== Role.CLIENT && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.UserName}</td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {order.TotalAmount.toLocaleString()} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {user.RoleId === Role.CLIENT ? (
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[order.StatusId]}`}>
                                {STATUS_LABELS[order.StatusId]}
                             </span>
                        ) : (
                            <select 
                                value={order.StatusId} 
                                onChange={(e) => handleStatusChange(order.OrderId, e.target.value)}
                                className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6`}
                            >
                                {Object.entries(STATUS_LABELS).map(([id, label]) => (
                                    <option key={id} value={id}>{label}</option>
                                ))}
                            </select>
                        )}
                    </td>
                    
                    {user.RoleId === Role.ADMIN && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                             <select 
                                className="border border-gray-300 rounded text-xs py-1 px-2 focus:ring-1 focus:ring-cyan-500 bg-white text-gray-900"
                                value={order.AssignedToUserId || ''}
                                onChange={(e) => handleAssignChange(order.OrderId, e.target.value)}
                             >
                                 <option value="">Не назначен</option>
                                 {employees.map(emp => (
                                     <option key={emp.UserId} value={emp.UserId}>{emp.FullName}</option>
                                 ))}
                             </select>
                        </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                        {user.RoleId === Role.EMPLOYEE && !order.AssignedToUserId && (
                            <button
                                onClick={() => takeOrder(order.OrderId)}
                                title="Взять в работу"
                                className="text-green-600 hover:text-green-900 p-1"
                            >
                                <CheckCircle size={20} />
                            </button>
                        )}
                        <button 
                            onClick={() => navigate(`/orders/${order.OrderId}`)}
                            title="Просмотр"
                            className="text-cyan-600 hover:text-cyan-900 p-1"
                        >
                            <Eye size={20} />
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;