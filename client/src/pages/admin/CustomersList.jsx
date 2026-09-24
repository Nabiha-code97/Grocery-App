import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext';

const CustomersList = () => {
    const { axios } = useAppContext();
    const [customers, setCustomers] = useState([]);

    const fetchCustomers = async () => {
        try {
            const { data } = await axios.get('/api/admin/customers')
            if (data.success) {
                setCustomers(data.customers)
            }
        } catch (error) {
            // ignore
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-lg font-medium">Registered Customers</h2>
                {customers.length === 0 ? (
                    <p className="text-gray-500">No customers registered yet.</p>
                ) : (
                    <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                        <table className="md:table-auto table-fixed w-full overflow-hidden">
                            <thead className="text-gray-900 text-sm text-left">
                                <tr>
                                    <th className="px-4 py-3 font-semibold truncate">Name</th>
                                    <th className="px-4 py-3 font-semibold truncate">Email</th>
                                    <th className="px-4 py-3 font-semibold truncate">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-500">
                                {customers.map((customer) => (
                                    <tr key={customer._id} className="border-t border-gray-500/20">
                                        <td className="px-4 py-3">{customer.name}</td>
                                        <td className="px-4 py-3">{customer.email}</td>
                                        <td className="px-4 py-3">{new Date(customer.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomersList
