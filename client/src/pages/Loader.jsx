import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Loader = () => {
    const [searchParams] = useSearchParams()
    const { axios, navigate, setCartItems } = useAppContext()

    useEffect(() => {
        const orderId = searchParams.get('orderId')
        const sessionId = searchParams.get('session_id')
        const next = searchParams.get('next') || ''

        const verify = async () => {
            try {
                const { data } = await axios.post('/api/order/stripe/verify', { orderId, session_id: sessionId })
                if (data.success) {
                    setCartItems({})
                    toast.success('Payment successful!')
                } else {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            } finally {
                navigate('/' + next)
            }
        }

        if (orderId && sessionId) {
            verify()
        } else {
            navigate('/')
        }
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Verifying payment...</p>
            </div>
        </div>
    )
}

export default Loader
