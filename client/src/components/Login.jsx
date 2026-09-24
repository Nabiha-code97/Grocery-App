import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import PasswordInput from './PasswordInput'
import toast from 'react-hot-toast'

const RESEND_COOLDOWN_MS = 30 * 1000

const Login = () => {
    const { setShowUserLogin, setUser, setCartItems, navigate, axios } = useAppContext()

    const [step, setStep] = useState("login")
    const [role, setRole] = useState("user")
    const [loading, setLoading] = useState(false)
    const [pendingRoles, setPendingRoles] = useState([])
    const [resendAt, setResendAt] = useState(0)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        shopName: '',
        phone: '',
        otp: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const errorMessage = (error) => error.response?.data?.message || error.message

    const selectRole = (nextRole) => {
        setRole(nextRole)
        if (nextRole === 'user') {
            setFormData(prev => ({ ...prev, shopName: '', phone: '' }))
        }
    }

    const finishAuth = (data) => {
        localStorage.setItem('userToken', data.token)
        axios.defaults.headers.common['user-token'] = data.token
        setUser(data.user)
        if (data.user.role === 'seller') setCartItems({})
        setShowUserLogin(false)
        navigate(data.user.role === 'seller' ? '/seller' : '/')
    }

    const doLogin = async (chosenRole) => {
        const { data } = await axios.post('/api/user/login', {
            email: formData.email,
            password: formData.password,
            ...(chosenRole && { role: chosenRole })
        })

        if (data.needsRole) {
            setPendingRoles(data.roles)
            setStep("pickRole")
            return
        }

        if (data.success) {
            finishAuth(data)
            toast.success('Logged in successfully')
        } else {
            toast.error(data.message)
        }
    }

    const sendOTP = async () => {
        const { data } = await axios.post('/api/auth/signup', {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role,
            ...(role === 'seller' && { shopName: formData.shopName, phone: formData.phone })
        })

        if (data.success) {
            setResendAt(Date.now() + RESEND_COOLDOWN_MS)
            setStep("otp")
            toast.success(`OTP sent to ${formData.email}`)
        } else {
            toast.error(data.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)

        try {
            if (step === "login") {
                await doLogin(null)
            } else if (step === "signup") {
                await sendOTP()
            } else if (step === "otp") {
                const { data } = await axios.post('/api/auth/verify-otp', {
                    email: formData.email,
                    role,
                    otp: formData.otp
                })
                if (data.success) {
                    finishAuth(data)
                    toast.success('Account created successfully')
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(errorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handlePickRole = async (chosenRole) => {
        if (loading) return
        setLoading(true)
        try {
            await doLogin(chosenRole)
        } catch (error) {
            toast.error(errorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (loading || Date.now() < resendAt) return
        setLoading(true)
        try {
            await sendOTP()
        } catch (error) {
            toast.error(errorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const heading = {
        login: "Login",
        signup: "Sign up",
        otp: "Verify Email",
        pickRole: "Choose Account"
    }[step]

    return (
        <div onClick={() => { setShowUserLogin(false) }} className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center justify-center text-sm text-gray-600 bg-black/50 '>
            <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
                <h1 className="text-gray-900 text-3xl mt-10 font-medium">{heading}</h1>

                {step === "pickRole" && (
                    <>
                        <p className="text-gray-500 text-sm mt-2">This email has more than one account.</p>
                        <div className="flex flex-col gap-3 mt-6">
                            {pendingRoles.map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handlePickRole(r)}
                                    className="w-full py-2.5 rounded-full border border-gray-300 hover:bg-primary/10 hover:border-primary transition disabled:opacity-60"
                                >
                                    Continue as {r === 'seller' ? 'Seller' : 'Customer'}
                                </button>
                            ))}
                        </div>
                        <p onClick={() => setStep("login")} className="text-gray-500 text-sm mt-6 mb-11 cursor-pointer">
                            Use a different account? <span className="text-primary hover:underline">click here</span>
                        </p>
                    </>
                )}

                {step === "otp" && (
                    <>
                        <p className="text-gray-500 text-sm mt-2">We sent a 6-digit code to {formData.email}</p>
                        <input
                            onChange={handleChange}
                            value={formData.otp}
                            name="otp"
                            className="w-full border mt-6 border-gray-300 rounded-full py-2.5 text-center tracking-[0.5em] text-lg outline-none"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            required
                        />
                        <button type="submit" disabled={loading} className="mt-6 w-full h-11 rounded-full text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-60">
                            {loading ? "Verifying..." : "Verify & Create Account"}
                        </button>
                        <p className="text-gray-500 text-sm mt-4">
                            Didn't get it?{" "}
                            <span onClick={handleResend} className={Date.now() < resendAt ? "text-gray-400" : "text-primary hover:underline cursor-pointer"}>
                                Resend code
                            </span>
                        </p>
                        <p onClick={() => setStep("signup")} className="text-gray-500 text-sm mt-2 mb-11 cursor-pointer">
                            Wrong email? <span className="text-primary hover:underline">go back</span>
                        </p>
                    </>
                )}

                {(step === "login" || step === "signup") && (
                    <>
                        {step === "signup" && (
                            <div className="flex gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => selectRole("user")}
                                    className={`flex-1 py-2 rounded-full border transition ${role === 'user' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'}`}
                                >
                                    I'm a Customer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => selectRole("seller")}
                                    className={`flex-1 py-2 rounded-full border transition ${role === 'seller' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'}`}
                                >
                                    I'm a Seller
                                </button>
                            </div>
                        )}

                        {step === "signup" && (
                            <input
                                onChange={handleChange}
                                value={formData.name}
                                name="name"
                                className="w-full border mt-4 bg-transparent border-gray-300 outline-none rounded-full py-2.5 px-4"
                                type="text"
                                placeholder="Full Name"
                                required
                            />
                        )}

                        <input
                            onChange={handleChange}
                            value={formData.email}
                            name="email"
                            className="w-full border mt-4 bg-transparent border-gray-300 outline-none rounded-full py-2.5 px-4"
                            type="email"
                            placeholder="Email id"
                            required
                        />

                        <div className="mt-4">
                            <PasswordInput
                                onChange={handleChange}
                                value={formData.password}
                                name="password"
                                className="w-full border bg-transparent border-gray-300 outline-none rounded-full py-2.5 px-4"
                                placeholder="Password"
                                minLength={step === "signup" ? 8 : undefined}
                                required
                            />
                        </div>

                        {step === "signup" && role === "seller" && (
                            <>
                                <input
                                    onChange={handleChange}
                                    value={formData.shopName}
                                    name="shopName"
                                    className="w-full border mt-4 bg-transparent border-gray-300 outline-none rounded-full py-2.5 px-4"
                                    type="text"
                                    placeholder="Shop Name"
                                    required
                                />
                                <input
                                    onChange={handleChange}
                                    value={formData.phone}
                                    name="phone"
                                    className="w-full border mt-4 bg-transparent border-gray-300 outline-none rounded-full py-2.5 px-4"
                                    type="tel"
                                    placeholder="Phone Number"
                                    required
                                />
                            </>
                        )}

                        <button type="submit" disabled={loading} className="mt-6 w-full h-11 rounded-full text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-60">
                            {loading ? "Please wait..." : step === "login" ? "Login" : "Send OTP"}
                        </button>

                        <p onClick={() => setStep(step === "login" ? "signup" : "login")} className="text-gray-500 text-sm mt-3 mb-11 cursor-pointer">
                            {step === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                            <span className="text-primary hover:underline">click here</span>
                        </p>
                    </>
                )}
            </form>
        </div>
    )
}

export default Login
