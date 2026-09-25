import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const Orders = () => {
    const { currency, axios } = useAppContext()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const errorMessage = (error) => error.response?.data?.message || error.message

    const ORDER_STATUSES = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/seller')
            if (data.success) {
                setOrders(data.orders)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(errorMessage(error))
        } finally {
            setLoading(false)
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            const { data } = await axios.post('/api/order/status', { orderId, status })
            if (data.success) {
                toast.success(data.message)
                fetchOrders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(errorMessage(error))
        }
    }

    useEffect(() => {
        fetchOrders();
    }, [])

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">Orders List</h2>
                {loading && <Spinner className='h-[60vh]' />}
                {!loading && orders.length === 0 && (
                    <p className="text-gray-500">No orders yet.</p>
                )}
                {!loading && orders.map((order, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300">
                        <div className="flex gap-5 max-w-80">
                            <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                            <div>
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex flex-col">
                                        <p className="font-medium">
                                            {item.product?.name || "Product unavailable"} {" "}<span className="text-primary">x {item.quantity}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-sm md:text-base text-black/60">
                            <p className='text-black/80'>{order.address.firstName} {order.address.lastName}</p>
                            <p>{order.address.street}, {order.address.city}</p>
                            <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                            <p>{order.address.phone}</p>
                        </div>

                        <p className="font-medium text-lg my-auto">{currency}{order.sellerAmount}</p>

                        <div className="flex flex-col text-sm gap-1">
                            <p>Method: {order.paymentType}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                            <select
                                value={order.status}
                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                className="mt-1 border border-gray-300 rounded px-2 py-1 outline-none text-gray-700"
                            >
                                {ORDER_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders
