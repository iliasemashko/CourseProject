import React, { useState } from 'react';
import { User, Role } from '../types';
import { StorageService } from '../services/storageService';
import { User as UserIcon, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  user: User;
  setUser: (u: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FullName: user.FullName,
    Email: user.Email,
    Phone: user.Phone || '',
    Password: ''
  });
  const [message, setMessage] = useState('');

  const handleSave = () => {
    const updated = { ...user, ...formData };
    if (!formData.Password) delete (updated as any).Password; // Don't overwrite if empty
    else updated.PasswordHash = formData.Password; // In real app, hash this

    StorageService.updateUser(updated);
    setUser(updated);
    setMessage('Профиль успешно обновлен');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-gray-500 hover:text-cyan-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" /> На главную
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="bg-cyan-100 p-4 rounded-full text-cyan-600">
            <UserIcon size={40} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
            <p className="text-gray-500">{user.RoleId === Role.ADMIN ? 'Администратор' : user.RoleId === Role.EMPLOYEE ? 'Сотрудник' : 'Клиент'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
         {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg">{message}</div>}
         
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input 
                type="text"
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                value={formData.FullName}
                onChange={e => setFormData({...formData, FullName: e.target.value})}
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
                type="email"
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                value={formData.Email}
                onChange={e => setFormData({...formData, Email: e.target.value})}
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input 
                type="text"
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                value={formData.Phone}
                onChange={e => setFormData({...formData, Phone: e.target.value})}
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль (оставьте пустым, если не меняете)</label>
            <input 
                type="password"
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                value={formData.Password}
                onChange={e => setFormData({...formData, Password: e.target.value})}
            />
         </div>

         <div className="pt-4">
            <button 
                onClick={handleSave}
                className="flex items-center justify-center gap-2 w-full bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
            >
                <Save size={20} /> Сохранить изменения
            </button>
         </div>
      </div>
    </div>
  )
}
export default Profile;