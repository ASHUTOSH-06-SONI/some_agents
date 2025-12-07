import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, PenTool } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <div className="container mx-auto px-4 py-16">
                <header className="flex justify-between items-center mb-16">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        <h1 className="text-2xl font-bold tracking-tighter">Warranty<span className="text-emerald-400">Guard</span></h1>
                    </div>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Operations Login</Link>
                </header>

                <main className="flex flex-col items-center text-center space-y-8">
                    <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                        Premium Care for Your Devices
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl">
                        Experience seamless warranty services with AI-powered diagnostics, instant logistics scheduling, and real-time tracking.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-4xl">
                        <Link to="/submit" className="group relative p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                            <PenTool className="w-12 h-12 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-2">Submit a Claim</h3>
                            <p className="text-gray-400">Start a new warranty claim for your device. We'll handle the rest.</p>
                        </Link>

                        <Link to="/track" className="group relative p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                            <Search className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-2">Track Status</h3>
                            <p className="text-gray-400">Check the real-time status of your repair or replacement.</p>
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;
