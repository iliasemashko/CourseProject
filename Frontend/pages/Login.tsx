import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';
import { loginUser, setToken } from '../services/api';
import { LogIn } from 'lucide-react';

interface LoginProps {
    setUser: (u: User) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const user = await loginUser(email, password);
            setUser(user);
            // Token уже установлен в loginUser
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Вход в систему</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-cyan-600 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogIn size={18} /> {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    Нет аккаунта? <Link to="/register" className="text-cyan-600 hover:underline">Зарегистрироваться</Link>
                </div>
                 <div className="mt-4 text-center text-xs text-gray-400">
                    <p>Demo accounts:</p>
                    <p>Admin: admin@santeh.ru / admin123</p>
                    <p>Employee: manager@santeh.ru / manager123</p>
                    <p>Client: client@mail.ru / client123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;