import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'
import { User } from '../types'
import { UserPlus } from 'lucide-react'

interface RegisterProps {
    setUser: (u: User) => void
}

const Register: React.FC<RegisterProps> = ({ setUser }) => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Пароль должен содержать минимум 8 символов')
            return
        }

        if (password !== confirm) {
            setError('Пароли не совпадают')
            return
        }

        setLoading(true)

        try {
            const user = await registerUser(fullName, email, password, 1)
            setUser(user)
            navigate('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка регистрации')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Регистрация</h2>

                {error !== '' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                        />
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Подтверждение пароля</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyan-600 text-white py-2.5 rounded-lg font-medium hover:bg-cyan-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <UserPlus size={18} /> {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Уже есть аккаунт? <Link to="/login" className="text-cyan-600 hover:underline">Войти</Link>
                </div>
            </div>
        </div>
    )
}

export default Register
