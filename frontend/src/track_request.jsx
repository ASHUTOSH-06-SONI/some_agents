import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkStatus } from './api.js';
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, Truck, Wrench } from 'lucide-react';

const TrackRequest = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [requestId, setRequestId] = useState(searchParams.get('id') || '');
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!requestId) return;
        setLoading(true);
        try {
            const data = await checkStatus(requestId);
            setStatusData(data);
        } catch (error) {
            alert('Request not found');
            setStatusData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchParams.get('id')) {
            handleSearch();
        }
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="w-12 h-12 text-emerald-400" />;
            case 'REJECTED': return <XCircle className="w-12 h-12 text-red-400" />;
            case 'PICKUP_SCHEDULED': return <Truck className="w-12 h-12 text-blue-400" />;
            case 'PICKUP_COMPLETED': return <Truck className="w-12 h-12 text-blue-400" />;
            case 'REPAIR_INITIATED': return <Wrench className="w-12 h-12 text-orange-400" />;
            case 'REPAIR_COMPLETED': return <CheckCircle className="w-12 h-12 text-emerald-400" />;
            case 'RETURN_SCHEDULED': return <Truck className="w-12 h-12 text-purple-400" />;
            default: return <Clock className="w-12 h-12 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </button>

            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl shadow-xl backdrop-blur-sm mb-8">
                    <h2 className="text-3xl font-bold mb-6">Track Request</h2>
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Enter Request ID"
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                            value={requestId}
                            onChange={(e) => setRequestId(e.target.value)}
                        />
                        <button type="submit" disabled={loading} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                            Track
                        </button>
                    </form>
                </div>

                {statusData && (
                    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-2xl shadow-xl backdrop-blur-sm animate-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-200">Request #{statusData.id}</h3>
                                <p className="text-gray-400 text-sm">Created: {new Date(statusData.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                {getStatusIcon(statusData.status)}
                                <span className="mt-2 font-mono text-emerald-400">{statusData.status}</span>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-gray-700 pt-6">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500">Product IMEI</label>
                                <p className="font-mono text-lg">{statusData.product_imei}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500">Issue</label>
                                <p className="text-gray-300">{statusData.issue_description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackRequest;
