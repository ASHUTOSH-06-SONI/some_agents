import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkStatus, updateLogistics, updateRepair } from '../api';
import { ArrowLeft, Truck, Wrench, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [requestId, setRequestId] = useState('');
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRequest = async () => {
        if (!requestId) return;
        setLoading(true);
        try {
            const data = await checkStatus(requestId);
            setRequestData(data);
        } catch (error) {
            alert('Request not found');
            setRequestData(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePickup = async () => {
        setActionLoading(true);
        try {
            await updateLogistics({ request_id: requestData.id, status: 'COMPLETED', agent_id: 'AGENT-007' });
            await fetchRequest();
        } catch (e) { alert(e.message) } finally { setActionLoading(false); }
    };

    const handleRepair = async () => {
        setActionLoading(true);
        try {
            await updateRepair({ request_id: requestData.id, status: 'COMPLETED', technician_id: 'TECH-99', notes: 'Fixed via Dashboard' });
            await fetchRequest();
        } catch (e) { alert(e.message) } finally { setActionLoading(false); }
    };

    const handleReturn = async () => {
        // In our simplified API, return is also a logistics update but usually triggered automatically.
        // However, if we want to manually complete the return delivery:
        setActionLoading(true);
        try {
            await updateLogistics({ request_id: requestData.id, status: 'COMPLETED', agent_id: 'AGENT-007' });
            await fetchRequest();
        } catch (e) { alert(e.message) } finally { setActionLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </button>

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center">
                    <AlertCircle className="w-8 h-8 text-yellow-400 mr-3" />
                    Operations Dashboard
                </h1>

                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl mb-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Scan/Enter Request ID"
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                            value={requestId}
                            onChange={(e) => setRequestId(e.target.value)}
                        />
                        <button onClick={fetchRequest} disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold transition-colors">
                            Load Request
                        </button>
                    </div>
                </div>

                {requestData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-4 text-gray-300">Request Details</h3>
                            <div className="space-y-2">
                                <p><span className="text-gray-500">ID:</span> {requestData.id}</p>
                                <p><span className="text-gray-500">IMEI:</span> {requestData.product_imei}</p>
                                <p><span className="text-gray-500">Status:</span> <span className="text-yellow-400 font-mono">{requestData.status}</span></p>
                                <p><span className="text-gray-500">Issue:</span> {requestData.issue_description}</p>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-4 text-gray-300">Actions</h3>
                            <div className="space-y-4">
                                {requestData.status === 'PICKUP_SCHEDULED' && (
                                    <button onClick={handlePickup} disabled={actionLoading} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-bold transition-colors">
                                        <Truck className="w-6 h-6 mr-2" /> Mark Pickup Completed
                                    </button>
                                )}

                                {requestData.status === 'REPAIR_INITIATED' && (
                                    <button onClick={handleRepair} disabled={actionLoading} className="w-full flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg font-bold transition-colors">
                                        <Wrench className="w-6 h-6 mr-2" /> Mark Repair Completed
                                    </button>
                                )}

                                {requestData.status === 'RETURN_SCHEDULED' && (
                                    <button onClick={handleReturn} disabled={actionLoading} className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-bold transition-colors">
                                        <Truck className="w-6 h-6 mr-2" /> Mark Return Delivered
                                    </button>
                                )}

                                {['APPROVED', 'PENDING', 'REJECTED', 'COMPLETED'].includes(requestData.status) && (
                                    <div className="text-center text-gray-500 py-4">
                                        No actions available for current status.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
