import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import PasswordInput from '../../components/PasswordInput'
import toast from 'react-hot-toast'

const AdminLogin = () => {
    const { isAdmin, setIsAdmin, navigate, axios } = useAppContext()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (loading) return
        setLoading(true)
        setError("")
        try {
            const { data } = await axios.post('/api/admin/login', { email, password })
            if (data.success) {
                localStorage.setItem('adminToken', data.token)
                axios.defaults.headers.common['admin-token'] = data.token
                setIsAdmin(true)
                toast.success('Admin logged in')
                navigate('/admin')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    if (isAdmin) return <Navigate to="/admin" replace />

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <form onSubmit={onSubmitHandler} className='w-full max-w-sm flex flex-col gap-5 p-8 py-10 rounded-xl shadow-xl border border-gray-200 bg-white text-sm text-gray-600'>

                <div className='text-center'>
                    <p className='text-2xl font-medium'><span className='text-primary'>Super Admin</span></p>
                    <p className='text-gray-400 text-xs mt-1'>Restricted access</p>
                </div>

                <div className="w-full">
                    <p>Email</p>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type="email"
                        placeholder="enter your email"
                        className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                        required
                    />
                </div>

                <div className="w-full">
                    <p>Password</p>
                    <div className="mt-1">
                        <PasswordInput
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="enter your password"
                            className="border border-gray-200 rounded w-full p-2 outline-primary"
                            required
                        />
                    </div>
                </div>

                {error && <p className='text-red-500 text-xs'>{error}</p>}

                <button disabled={loading} className="bg-primary text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-60">
                    {loading ? 'Signing in...' : 'Login'}
                </button>

                <Link to="/" className='text-center text-xs text-gray-400 hover:text-primary'>Back to store</Link>
            </form>
        </div>
    )
}

export default AdminLogin
