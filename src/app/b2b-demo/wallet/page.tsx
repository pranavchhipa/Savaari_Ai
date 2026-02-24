'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronDown, Download, Filter, Plus, Search, Shield, Wallet, X } from 'lucide-react';

export default function AgentWallet() {
    const router = useRouter();
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [amount, setAmount] = useState('5000');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [balance, setBalance] = useState(12500);

    // Mock ledger data based on the PRD specification
    const transactions = [
        { id: 'TXN-098271', date: '24 Feb, 2026', type: 'DEBIT', amount: 3200, balance: 12500, desc: 'Booking PNR-88219 (25% Advance)' },
        { id: 'TXN-098270', date: '22 Feb, 2026', type: 'CREDIT', amount: 10000, balance: 15700, desc: 'Wallet Top-Up via Razorpay' },
        { id: 'TXN-098269', date: '18 Feb, 2026', type: 'DEBIT', amount: 8400, balance: 5700, desc: 'Booking PNR-88102 (Full Settlement)' },
        { id: 'TXN-098268', date: '15 Feb, 2026', type: 'CREDIT', amount: 450, balance: 14100, desc: 'Refund for Toll adjustment PNR-87999' },
        { id: 'TXN-098267', date: '10 Feb, 2026', type: 'DEBIT', amount: 2000, balance: 13650, desc: 'Booking PNR-87820 (25% Advance)' },
    ];

    const handleTopUp = () => {
        setIsProcessing(true);
        // Simulate Razorpay loading
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setBalance(balance + parseInt(amount));

            // Auto close success modal
            setTimeout(() => {
                setIsSuccess(false);
                setShowTopUpModal(false);
                setAmount('5000');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* B2B Authenticated Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center cursor-pointer" onClick={() => router.push('/b2b-demo/dashboard')}>
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-gray-900 tracking-tight block leading-none pt-1">Savaari</span>
                            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">B2B Agent Portal</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/b2b-demo/dashboard'); }} className="text-sm font-semibold text-gray-500 hover:text-gray-900 py-7 transition-colors">Explore Cabs</a>
                        <a href="#" className="text-sm font-semibold text-gray-500 hover:text-gray-900 py-7 transition-colors">My Bookings</a>
                        <a href="#" className="text-sm font-bold text-[#2563EB] border-b-2 border-[#2563EB] py-7">Wallet</a>
                    </nav>

                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                            DT
                        </div>
                        <div className="hidden lg:block">
                            <span className="block text-sm font-bold text-gray-900">Doe Travels</span>
                            <span className="block text-xs text-gray-500 font-medium">Agent ID: SVA-8921</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

                {/* Left Column: Wallet Status (Sticky on Desktop) */}
                <div className="w-full md:w-80 flex-shrink-0">
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col h-full md:sticky md:top-28">

                        <div className="flex items-center gap-2 mb-6">
                            <Wallet className="w-5 h-5 text-[#2563EB]" />
                            <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">Wallet Hub</h2>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-[#0F172A] rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-lg shadow-gray-900/20">
                            {/* Decorative arcs */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl transform -translate-x-10 translate-y-10"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Available Balance</span>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase rounded border border-green-500/30">Active</span>
                                </div>
                                <h3 className="text-4xl font-bold tracking-tight mb-1">
                                    ₹ {balance.toLocaleString('en-IN')}<span className="text-lg text-gray-400 font-medium">.00</span>
                                </h3>
                                <p className="text-xs text-blue-300 mt-4 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Secured by Razorpay</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowTopUpModal(true)}
                            className="w-full py-4 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 mt-auto"
                        >
                            <Plus className="w-5 h-5" /> Top-Up Wallet
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-3">Instant credit via UPI/NetBanking</p>

                    </div>
                </div>

                {/* Right Column: Ledger */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col">

                    {/* Ledger Header & Filters */}
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input type="text" placeholder="Search TXN ID..." className="w-full sm:w-48 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2563EB]" />
                            </div>
                            <button className="p-2 border border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="p-2 border border-gray-200 text-[#2563EB] bg-blue-50 flex items-center gap-2 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                                <Download className="w-4 h-4" /> Export
                            </button>
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="p-4 pl-6 font-semibold">Date & ID</th>
                                    <th className="p-4 font-semibold">Description</th>
                                    <th className="p-4 font-semibold text-right">Debit</th>
                                    <th className="p-4 font-semibold text-right">Credit</th>
                                    <th className="p-4 pr-6 font-semibold text-right text-gray-400">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {transactions.map((txn, i) => (
                                    <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 pl-6 align-top">
                                            <div className="font-semibold text-gray-900">{txn.date}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{txn.id}</div>
                                        </td>
                                        <td className="p-4 align-top w-1/2">
                                            <div className="text-gray-700 font-medium">{txn.desc}</div>
                                            <div className="text-xs text-[#2563EB] font-medium mt-1 cursor-pointer hover:underline">View Invoice</div>
                                        </td>
                                        <td className="p-4 align-top text-right font-semibold text-gray-900">
                                            {txn.type === 'DEBIT' ? `₹ ${txn.amount.toLocaleString('en-IN')}` : '-'}
                                        </td>
                                        <td className="p-4 align-top text-right font-bold text-green-600">
                                            {txn.type === 'CREDIT' ? `+ ₹ ${txn.amount.toLocaleString('en-IN')}` : '-'}
                                        </td>
                                        <td className="p-4 pr-6 align-top text-right text-gray-400 font-medium">
                                            ₹ {txn.balance.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                        <span>Showing 1-5 of 142 transactions</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-200 rounded text-gray-400 cursor-not-allowed">Prevent</button>
                            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-700 font-medium">Next</button>
                        </div>
                    </div>

                </div>
            </main>

            {/* TopUp Simulator Modal */}
            <AnimatePresence>
                {showTopUpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative"
                        >
                            {!isProcessing && !isSuccess && (
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            {isSuccess ? (
                                <div className="p-10 text-center">
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <Shield className="w-10 h-10 text-green-500" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h3>
                                    <p className="text-gray-500">₹ {parseInt(amount).toLocaleString('en-IN')} added to wallet.</p>
                                </div>
                            ) : isProcessing ? (
                                <div className="p-10 text-center">
                                    <div className="w-16 h-16 border-4 border-gray-100 border-t-[#2563EB] rounded-full animate-spin mx-auto mb-4"></div>
                                    <h3 className="text-lg font-bold text-gray-900">Processing Payment...</h3>
                                    <p className="text-gray-500 text-sm mt-1">Please do not close this window.</p>
                                </div>
                            ) : (
                                <div className="p-8">
                                    <div className="flex items-center gap-2 mb-6 text-[#2563EB]">
                                        <Wallet className="w-5 h-5" />
                                        <h3 className="text-xl font-bold text-gray-900">Add Funds</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Enter Amount (₹)</label>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            {['2000', '5000', '10000'].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => setAmount(val)}
                                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors ${amount === val ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    +₹ {val}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-500">Amount</span>
                                                <span className="font-semibold text-gray-900">₹ {amount || '0'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Gateway Fee</span>
                                                <span>₹ 0.00</span>
                                            </div>
                                            <div className="w-full h-px bg-gray-200 my-2"></div>
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-900">Total Payable</span>
                                                <span className="font-bold text-[#2563EB]">₹ {amount || '0'}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleTopUp}
                                            disabled={!amount || parseInt(amount) <= 0}
                                            className="w-full py-4 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Proceed to Pay
                                        </button>
                                        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest leading-relaxed">Secured by Razorpay • Instant Credit</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
