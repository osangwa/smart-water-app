import { useState, useEffect } from 'react';
import UsageChart from "../components/UsageChart"
import Sidebar from '../components/Sidebar';
import pb from '../utils/pocketbase';
import { Zap } from 'lucide-react';
import Prediction from '../components/Prediction';
import Recommendation from '../components/Recommendation';

export default function Dashboard() {


    const [waterUsage, setWaterUsage] = useState(0);
    const [fullUsage, setFullUsage] = useState([]);
    const [alerts, setAlerts] = useState(0);
    const [leakageRisk, setLeakageRisk] = useState('Low');
    const [timeOfDay, setTimeOfDay] = useState('');

    const calculatePredictedBill = (litres) => {
        const cubicMeters = litres / 1000;
        let remaining = cubicMeters;
        let bill = 0;

        if (remaining <= 0) return 0;

        const blocks = [
            { limit: 5, rate: 340 },
            { limit: 15, rate: 720 },  // 6–20
            { limit: 30, rate: 845 },  // 21–50
            { limit: Infinity, rate: 877 } // Above 50
        ];

        for (const block of blocks) {
            const used = Math.min(remaining, block.limit);
            bill += used * block.rate;
            remaining -= used;
            if (remaining <= 0) break;
        }

        return bill.toFixed(2);
    };


    useEffect(() => {
        const getTimeOfDay = () => {
            const hour = new Date().getHours();
            if (hour < 12) return 'Morning';
            if (hour < 18) return 'Afternoon';
            return 'Evening';
        };
        setTimeOfDay(getTimeOfDay());

        async function fetch_details() {
            try {

                const all_usage = await pb.collection("consumption").getFullList();

                const current_usage = await pb.collection("consumption").getFirstListItem("", {
                    sort: "-created"
                });


                const today = new Date();
                const startOfDay = today.toISOString().split("T")[0] + " 00:00:00";
                const endOfDay = today.toISOString().split("T")[0] + " 23:59:59";


                const current_alert = await pb.collection("leakages").getFullList({
                    filter: `created >= "${startOfDay}" && created <= "${endOfDay}"`
                });

                setFullUsage(all_usage);
                setAlerts(current_alert.length);
                setWaterUsage(current_usage?.litre || 0);

                // console.log("Current alerts count:", current_alert.length);

                setLeakageRisk(current_alert[current_alert.length-1].level)
                // console.log(current_alert[current_alert.length-1].level)
                
                // setLeakageRisk(
                //     current_alert.length === 0 ? "Low"
                //         : current_alert.length > 3 ? "High"
                //             : current_alert.length === 1 ? "Medium"
                //                 : "High"
                // );

            } catch (error) {
                console.error("Error fetching details:", error);
            }
        }

        fetch_details()
        setInterval(() => fetch_details(), 2000)
    }, []);

    const predictedBill = calculatePredictedBill(waterUsage);

    return (
        <div className="flex h-screen bg-gray-100">

            <Sidebar />

            {/* Main Content */}
            <div className="overflow-auto flex-1">
                <div className="p-8">
                    <div className="space-y-6">
                        <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
                            <div className="mx-auto max-w-7xl">
                                <div className="mb-8">
                                    <h1 className="text-4xl font-bold text-blue-900">Smart Water Dashboard</h1>
                                    <p className="text-blue-600">
                                        Good {timeOfDay}! Here's your water consumption overview
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {/* Current Usage Card */}
                                    <div className="p-6 bg-white rounded-2xl border-2 border-blue-200 shadow-lg transition-all hover:border-blue-400">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-semibold text-gray-800">Current Usage</h2>
                                            <div className="animate-pulse">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold text-blue-600">
                                                {waterUsage.toFixed(1)}
                                            </span>
                                            <span className="ml-2 text-gray-600">Liters</span>
                                        </div>
                                        {/* <div className="mt-4 text-sm text-gray-500">Updated in real-time</div> */}
                                    </div>

                                    {/* Prediction Card */}
                                    <div className="p-6 bg-white rounded-2xl border-2 border-purple-200 shadow-lg transition-all hover:border-purple-400">
                                        <h2 className="text-xl font-semibold text-gray-800">Recent Alerts</h2>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold text-purple-600">
                                                {alerts}
                                            </span>
                                            {/* <span className="ml-2 text-gray-600">Liters</span> */}
                                        </div>
                                        {/* <div className="mt-4 text-sm text-gray-500">Predicted for tomorrow</div> */}
                                    </div>

                                    {/* Leakage Risk Card */}
                                    <div className="p-6 bg-white rounded-2xl border-2 border-green-200 shadow-lg transition-all hover:border-green-400">
                                        <h2 className="text-xl font-semibold text-gray-800">Leakage Risk</h2>
                                        <div className="mt-4">
                                            <span
                                                className={`text-4xl font-bold ${leakageRisk === 'Low' ? 'text-green-500' : leakageRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}
                                            >
                                                {leakageRisk}
                                            </span>
                                        </div>
                                        {/* <div className="mt-4 text-sm text-gray-500">No issues detected</div> */}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                                
                                                                  {/* Predicted Bill Section */}
                                                                  <div className="p-6 mt-8 bg-white rounded-2xl shadow-lg">
                                        <h2 className="mb-4 text-2xl font-semibold text-gray-800">Predicted Monthly Bill</h2>
                                        <div className="text-center">
                                            <p className="text-4xl font-bold text-blue-700">
                                                {predictedBill} Rwf
                                            </p>
                                            <p className="text-gray-500 mt-1 text-sm">based on current usage</p>
                                        </div>
                                    </div>
                                



                                {/* Recommendations Section */}
                                <div className="p-6 mt-8 bg-white rounded-2xl shadow-lg">
                                    <h2 className="mb-4 text-2xl font-semibold text-gray-800">Recommendations</h2>
                                    {alerts != 0 ? <Recommendation /> : <div className='py-5 text-lg font-semibold text-center text-gray-500'>No Recommendations at this momment</div>}
                                </div>
                                </div>

                                {/* Usage graph */}
                                <div className="p-6 mt-8 bg-white rounded-2xl shadow-lg">
                                    {/* <h2 className="mb-4 text-2xl font-semibold text-gray-800">Recommendations</h2> */}

                                    <Prediction usage={fullUsage} />
                                    {/* {alerts != 0 ? <Recommendation /> : <div className='py-5 text-lg font-semibold text-center text-gray-500'>No Recommendations at this momment</div>} */}

                                </div>

                                {/* Usage Graph */}
                                <div className="p-6 mt-8 bg-white rounded-2xl shadow-lg">
                                    <h2 className="mb-4 text-2xl font-semibold text-gray-800">Usage Trends ({new Date().toDateString()})</h2>
                                    <div className="w-full h-[400px]">
                                        <UsageChart usage={fullUsage} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

