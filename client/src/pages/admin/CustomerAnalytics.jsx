import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAppContext } from '../../context/AppContext';

const RANGES = ['daily', 'weekly', 'monthly'];

const CustomerAnalytics = () => {
    const { axios } = useAppContext();
    const [range, setRange] = useState('daily');
    const [data, setData] = useState([]);

    const fetchAnalytics = async () => {
        try {
            const { data: res } = await axios.get(`/api/admin/analytics/customers?range=${range}`)
            if (res.success) {
                setData(res.data)
            }
        } catch (error) {
            // ignore
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [range])

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <div className="flex items-center justify-between pb-4">
                    <h2 className="text-lg font-medium">Customer Signups</h2>
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

                {data.length === 0 ? (
                    <p className="text-gray-500">No signups in this period.</p>
                ) : (
                    <div className="bg-white border border-gray-500/20 rounded-md p-4" style={{ height: 360 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#4fbf8b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerAnalytics
