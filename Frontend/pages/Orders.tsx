import React, { useState, useEffect } from 'react';
import { User, Order, Role, OrderStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { FileText, Eye, CheckCircle, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import RobotoTTF from '../fonts/Roboto-VariableFont_wdth,wght.ttf';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder, updateOrderStatus, assignOrder } from '../services/api';

interface OrdersProps {
  user: User;
}

const Orders: React.FC<OrdersProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'assigned' | 'new'>('assigned');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Порядок статусов для отображения
  const statusOrder = [
    OrderStatus.CREATED,
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED
  ];

  useEffect(() => {
    refreshOrders();
  }, [user]);

  const refreshOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const allOrders = await getOrders();
      if (user.RoleId === Role.CLIENT) {
        setOrders(allOrders.filter(o => o.UserId === user.UserId));
      } else {
        setOrders(allOrders);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayedOrders = () => {
    let result = orders;

    if (statusFilter !== 'all') {
      result = result.filter(o => o.StatusId === Number(statusFilter));
    }

    if (user.RoleId === Role.EMPLOYEE) {
      if (viewMode === 'assigned') {
        result = result.filter(o => o.AssignedToUserId === user.UserId);
      } else if (viewMode === 'new') {
        result = result.filter(o => !o.AssignedToUserId && o.StatusId === OrderStatus.CREATED);
      }
    }

    return result;
  };

  const filteredOrders = getDisplayedOrders();

  const visibleColumnsCount = () => {
    let count = 5;
    if (user.RoleId !== Role.CLIENT) count += 1;
    if (user.RoleId === Role.ADMIN) count += 1;
    return count;
  };

  const exportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const response = await fetch(RobotoTTF);
    const fontBlob = await response.blob();
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64Font = (reader.result as string).split(',')[1];
      
      doc.addFileToVFS('Roboto.ttf', base64Font);
      doc.addFont('Roboto.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto');
      
      doc.setFontSize(18);
      doc.text('Отчет по заказам - SantehOrders', 14, 22);

      const tableData = filteredOrders.map(o => [
        o.OrderId.toString(),
        new Date(o.CreatedAt).toLocaleDateString('ru-RU'),
        o.UserName || '',
        o.TotalAmount.toLocaleString('ru-RU') + ' ₽',
        STATUS_LABELS[o.StatusId] || 'Неизвестно',
        o.AssignedToName || 'Не назначен'
      ]) as string[][];

      autoTable(doc, {
        head: [['ID', 'Дата', 'Клиент', 'Сумма', 'Статус', 'Исполнитель']],
        body: tableData,
        startY: 30,
        styles: { 
          font: 'Roboto',
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [6, 182, 212],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });

      doc.save('orders_report.pdf');
    };
    
    reader.readAsDataURL(fontBlob);
  };

  const handleStatusChange = async (orderId: number, newStatusStr: string) => {
    const newStatus = Number(newStatusStr);
    
    const currentOrder = orders.find(o => o.OrderId === orderId);
    if (currentOrder && currentOrder.StatusId === newStatus) {
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.OrderId === orderId 
            ? { ...o, StatusId: newStatus }
            : o
        )
      );
      
      await refreshOrders();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Ошибка при обновлении статуса: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'));
      await refreshOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) return;

    setUpdatingOrderId(orderId);
    try {
      await deleteOrder(orderId);
      await refreshOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Ошибка при удалении заказа: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const takeOrder = async (orderId: number) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, OrderStatus.PROCESSING);
      await assignOrder(orderId, user.UserId);
      
      await refreshOrders();
      setViewMode('assigned');
    } catch (err) {
      console.error('Error taking order:', err);
      alert('Ошибка при взятии заказа в работу: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'));
    } finally {
      setUpdatingOrderId(null);
    }
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
                className={`text-sm px-4 py-2 rounded-lg transition-colors border ${
                  viewMode === 'assigned' 
                    ? 'bg-cyan-600 text-white border-cyan-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Мои задачи
              </button>
              <button 
                onClick={() => setViewMode('new')} 
                className={`text-sm px-4 py-2 rounded-lg transition-colors border ${
                  viewMode === 'new' 
                    ? 'bg-cyan-600 text-white border-cyan-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Новые заказы
              </button>
              <button 
                onClick={() => setViewMode('all')} 
                className={`text-sm px-4 py-2 rounded-lg transition-colors border ${
                  viewMode === 'all' 
                    ? 'bg-cyan-600 text-white border-cyan-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
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
            {statusOrder.map((statusId) => (
              <option key={statusId} value={statusId}>
                {STATUS_LABELS[statusId]}
              </option>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

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
              {loading ? (
                <tr>
                  <td colSpan={visibleColumnsCount()} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnsCount()} className="px-6 py-8 text-center text-gray-500">
                    Заказов не найдено
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.OrderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.OrderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.CreatedAt).toLocaleDateString('ru-RU')}
                    </td>
                    {user.RoleId !== Role.CLIENT && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.UserName}
                      </td>
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
                          value={order.StatusId?.toString()} 
                          onChange={(e) => handleStatusChange(order.OrderId, e.target.value)} 
                          disabled={updatingOrderId === order.OrderId}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6 ${
                            updatingOrderId === order.OrderId ? 'opacity-50 cursor-wait' : ''
                          }`}
                        >
                          {statusOrder.map((statusId) => (
                            <option key={statusId} value={statusId}>
                              {STATUS_LABELS[statusId]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    {user.RoleId === Role.ADMIN && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.AssignedToName || 'Не назначен'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        {user.RoleId === Role.EMPLOYEE && !order.AssignedToUserId && (
                          <button 
                            onClick={() => takeOrder(order.OrderId)} 
                            disabled={updatingOrderId === order.OrderId}
                            title="Взять в работу" 
                            className={`text-green-600 hover:text-green-900 p-1 ${
                              updatingOrderId === order.OrderId ? 'opacity-50 cursor-wait' : ''
                            }`}
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
                        {user.RoleId === Role.ADMIN && (
                          <button 
                            onClick={() => handleDeleteOrder(order.OrderId)} 
                            disabled={updatingOrderId === order.OrderId}
                            title="Удалить" 
                            className={`text-red-600 hover:text-red-900 p-1 ${
                              updatingOrderId === order.OrderId ? 'opacity-50 cursor-wait' : ''
                            }`}
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
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