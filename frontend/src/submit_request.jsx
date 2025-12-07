import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRequest } from '../api';
import { ArrowLeft, Loader2 } from 'lucide-react';

const SubmitRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: 'CUST-' + Math.floor(Math.random() * 1000),
        product_imei: '',
        issue_description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await submitRequest(formData);
            navigate(`/track?id=${res.id}`);
        } catch (error) {
            alert('Error submitting request: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </button>

            <div className="max-w-md mx-auto bg-gray-800/50 border border-gray-700 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">Submit Claim</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Product IMEI</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. 123456789012345"
                            value={formData.product_imei}
                            onChange={(e) => setFormData({ ...formData, product_imei: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Issue Description</label>
                        <textarea
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-32"
                            placeholder="Describe the problem..."
                            value={formData.issue_description}
                            onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Claim'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitRequest;
