import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAppContext } from '../../context/AppContext';

const RANGES = ['daily', 'weekly', 'monthly'];

const SalesTrends = () => {
    const { axios, currency } = useAppContext();
    const [range, setRange] = useState('daily');
    const [trend, setTrend] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);

    const fetchTrend = async () => {
        try {
            const { data } = await axios.get(`/api/admin/analytics/sales-trends?range=${range}`)
            if (data.success) {
                setTrend(data.data)
            }
        } catch (error) {
            // ignore
        }
    }

    const fetchBestSellers = async () => {
        try {
            const { data } = await axios.get('/api/admin/analytics/best-sellers')
            if (data.success) {
                setBestSellers(data.products)
            }
        } catch (error) {
            // ignore
        }
    }

    useEffect(() => {
        fetchTrend()
    }, [range])

    useEffect(() => {
        fetchBestSellers()
    }, [])

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4 flex flex-col gap-8">

                <div>
                    <div className="flex items-center justify-between pb-4">
                        <h2 className="text-lg font-medium">Revenue Trend</h2>
                        <div className="flex gap-2">
                            {RANGES.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className={`px-3 py-1 rounded-md text-sm capitalize border ${range === r ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600"}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {trend.length === 0 ? (
                        <p className="text-gray-500">No sales in this period.</p>
                    ) : (
                        <div className="bg-white border border-gray-500/20 rounded-md p-4" style={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${currency}${value}`} />
                                    <Line type="monotone" dataKey="revenue" stroke="#4fbf8b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="pb-4 text-lg font-medium">Best-Selling Products</h2>

                    {bestSellers.length === 0 ? (
                        <p className="text-gray-500">No sales yet.</p>
                    ) : (
                        <>
                            <div className="bg-white border border-gray-500/20 rounded-md p-4 mb-4" style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bestSellers}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" hide />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="totalQuantity" fill="#4fbf8b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex flex-col max-w-4xl w-full rounded-md bg-white border border-gray-500/20 divide-y divide-gray-500/20">
                                {bestSellers.map((product) => (
                                    <div key={product.productId} className="flex items-center gap-3 px-4 py-3">
                                        <div className="border border-gray-300 rounded overflow-hidden w-14 h-14 flex-shrink-0">
                                            {product.image ? (
                                                <img src={product.image} alt="Product" className="w-full h-full object-cover" />
                                            ) : null}
                                        </div>
                                        <span className="flex-1 truncate">{product.name || "Product unavailable"}</span>
                                        <span className="text-sm text-gray-500">{product.totalQuantity} sold</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SalesTrends
