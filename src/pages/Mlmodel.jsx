import { useEffect, useState } from "react";
import MainContainer from "../components/MainContainer";
import Sidebar from "../components/Sidebar";
import axios from "axios";

export default function Mlmodel(){

    const [predicted, setPredicted] = useState({});
    
    useEffect(()=>{
        async function getData(){
            const me = await axios.get("https://raw.githubusercontent.com/gabriel-uwanyirigira/smart_water_meter/main/forecast.json");

            setPredicted(me.data);
            console.log(me);
        }

        getData();
        setInterval(getData, 1000 * 60 * 1);

    }, [])
  
    return (
        <>
        <div className="flex h-screen bg-gray-100">
        
                    <Sidebar />
        
                    {/* Main Content */}
                    <MainContainer>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800">Machine Learning predicted values</h2>
                            <div className="flex items-center justify-between">
                                <div className="bg-white rounded-xl mx-auto mt-[50px] w-[500px] shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Prediction #{1}</span>
                                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Latest</span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-baseline">
                                                <h3 className="text-3xl font-bold text-blue-600">{predicted.predicted_outlet_litre}</h3>
                                                <span className="ml-1 text-xl text-gray-500">L</span>
                                            </div>
                                            <p className="text-sm text-gray-500">Predicted Water Usage</p>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                {new Date(predicted.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MainContainer>
                </div>
        </>
    )
}