import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext';

const SellersList = () => {
    const { axios } = useAppContext();
    const [sellers, setSellers] = useState([]);

    const fetchSellers = async () => {
        try {
            const { data } = await axios.get('/api/admin/sellers')
            if (data.success) {
                setSellers(data.sellers)
            }
        } catch (error) {
            // ignore
        }
    }

    useEffect(() => {
        fetchSellers()
    }, [])

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-lg font-medium">Registered Sellers</h2>
                {sellers.length === 0 ? (
                    <p className="text-gray-500">No sellers registered yet.</p>
                ) : (
                    <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                        <table className="md:table-auto table-fixed w-full overflow-hidden">
                            <thead className="text-gray-900 text-sm text-left">
                                <tr>
                                    <th className="px-4 py-3 font-semibold truncate">Name</th>
                                    <th className="px-4 py-3 font-semibold truncate">Email</th>
                                    <th className="px-4 py-3 font-semibold truncate hidden md:block">Shop Name</th>
                                    <th className="px-4 py-3 font-semibold truncate">Phone</th>
                                    <th className="px-4 py-3 font-semibold truncate">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-500">
                                {sellers.map((seller) => (
                                    <tr key={seller._id} className="border-t border-gray-500/20">
                                        <td className="px-4 py-3">{seller.name}</td>
                                        <td className="px-4 py-3">{seller.email}</td>
                                        <td className="px-4 py-3 max-sm:hidden">{seller.shopName}</td>
                                        <td className="px-4 py-3">{seller.phone}</td>
                                        <td className="px-4 py-3">{new Date(seller.createdAt).toLocaleDateString()}</td>
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

export default SellersList
