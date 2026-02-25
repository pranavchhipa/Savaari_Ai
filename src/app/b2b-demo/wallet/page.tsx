'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, Filter, Download, X, Shield, IndianRupee } from 'lucide-react';
import B2BHeader from '../components/B2BHeader';
import { useState } from 'react';

export default function WalletDashboard() {
    const router = useRouter();
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [walletBalance, setWalletBalance] = useState(24500);

    // Dummy transaction history reflecting the PRD requirements
    const [transactions, setTransactions] = useState([
        { id: 'TXN-902183', date: '25 Feb 2026', time: '11:30 AM', type: 'Credit', category: 'Top-Up', ref: 'razorpay_pay_M...', amount: 50000, balance: 74500, status: 'Success' },
        { id: 'TXN-882190', date: '24 Feb 2026', time: '09:15 AM', type: 'Debit', category: 'Booking', ref: 'SBN-8821', amount: 2500, balance: 24500, status: 'Success' },
        { id: 'TXN-865012', date: '20 Feb 2026', time: '14:20 PM', type: 'Debit', category: 'Booking', ref: 'SBN-8650', amount: 6000, balance: 27000, status: 'Success' },
        { id: 'TXN-865099', date: '18 Feb 2026', time: '10:00 AM', type: 'Credit', category: 'Refund', ref: 'SBN-8100', amount: 1500, balance: 33000, status: 'Success' },
        { id: 'TXN-812345', date: '10 Feb 2026', time: '16:45 PM', type: 'Credit', category: 'Top-Up', ref: 'razorpay_pay_N...', amount: 20000, balance: 31500, status: 'Success' },
    ]);

    const handleTopUp = () => {
        setIsProcessing(true);
        // Simulate Razorpay Gateway & Backend Logic
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            const newBalance = walletBalance + Number(topUpAmount);
            setWalletBalance(newBalance);

            // Add new transaction to history
            const newTxn = {
                id: `TXN-${Math.floor(Math.random() * 900000) + 100000}`,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: 'Credit',
                category: 'Top-Up',
                ref: `razorpay_pay_${Math.random().toString(36).substring(7).toUpperCase()}`,
                amount: Number(topUpAmount),
                balance: newBalance,
                status: 'Success'
            };

            setTransactions([newTxn, ...transactions]);

            setTimeout(() => {
                setShowTopUpModal(false);
                setIsSuccess(false);
                setTopUpAmount('');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <B2BHeader />

            {/* Breadcrumb Row */}
            <div className="bg-[#F2F2F2] border-b border-gray-200 py-2">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-[10px] text-gray-500 flex gap-1 items-center">
                        <span className="hover:underline cursor-pointer" onClick={() => router.push('/b2b-demo/dashboard')}>Home</span>
                        <span>&gt;</span>
                        <span className="text-gray-800 font-medium">Wallet</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 mb-1">
                        <button onClick={() => router.push('/b2b-demo/dashboard')} className="p-1 hover:bg-gray-300 rounded-full transition-colors -ml-1">
                            <ArrowLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <h1 className="text-gray-800 text-lg font-bold">Agent Wallet</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 w-full py-8 space-y-8">

                {/* Balance & Actions Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary Balance Card */}
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#1FA6DD] to-[#1578A3] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/4"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Wallet className="w-5 h-5 text-blue-100" />
                                    <h2 className="text-blue-100 font-medium text-sm tracking-wide uppercase">Available Balance</h2>
                                </div>
                                <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                                    <span className="text-2xl font-semibold mr-1">₹</span>{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <span className="px-2 py-1 bg-green-500/20 text-green-100 text-[10px] font-bold uppercase rounded border border-green-400/30">Active</span>
                                    <p className="text-xs text-blue-100 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Ready for bookings
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowTopUpModal(true)}
                                className="bg-white text-[#1FA6DD] hover:bg-gray-50 px-8 py-4 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Add Funds
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <IndianRupee className="w-4 h-4 text-gray-400" />
                            Account Limits
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Credit Limit</span>
                                <span className="font-bold text-gray-800">₹ 0.00</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Bank Info</span>
                                <span className="text-sm font-medium text-gray-800 text-right">
                                    HDFC Bank<br /><span className="text-xs text-gray-500">...3456</span>
                                </span>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] text-gray-400 leading-tight">Minimum 25% wallet balance required to use 'Agent + Wallet' checkout option.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History Ledger */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-gray-800">Transaction Ledger</h2>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                <Filter className="w-4 h-4" />
                                Filter Date
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1FA6DD] bg-blue-50 border border-[#1FA6DD]/20 rounded-lg hover:bg-blue-100 transition-colors">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F9F9F9] text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg">Date & TXN ID</th>
                                    <th className="px-6 py-4">Ref / Category</th>
                                    <th className="px-6 py-4 text-right">Debit</th>
                                    <th className="px-6 py-4 text-right">Credit</th>
                                    <th className="px-6 py-4 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((txn, index) => (
                                    <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800 group-hover:text-[#1FA6DD] transition-colors">{txn.id}</span>
                                                <span className="text-xs text-gray-500">{txn.date} • {txn.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-gray-700 font-medium">{txn.ref}</span>
                                                <div className="flex items-center gap-1">
                                                    {txn.type === 'Credit' ? (
                                                        <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-green-100">
                                                            <ArrowDownLeft className="w-3 h-3" />
                                                            {txn.category}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-orange-100">
                                                            <ArrowUpRight className="w-3 h-3" />
                                                            {txn.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                                            {txn.type === 'Debit' ? `- ₹${txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">
                                            {txn.type === 'Credit' ? `+ ₹${txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600 font-semibold">
                                            ₹{txn.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            {/* Top-Up Modal (Simulates Razorpay Flow) */}
            {showTopUpModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                        {isSuccess ? (
                            <div className="p-8 text-center bg-green-50">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                    <Shield className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                                <p className="text-gray-600 font-medium">₹ {Number(topUpAmount).toLocaleString('en-IN')} has been added directly to your wallet.</p>
                            </div>
                        ) : isProcessing ? (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 border-4 border-gray-100 border-t-[#1FA6DD] rounded-full animate-spin mx-auto mb-4"></div>
                                <h3 className="text-lg font-bold text-gray-900">Processing with Razorpay...</h3>
                                <p className="text-gray-500 text-sm mt-2 font-medium">Please do not refresh or close this window.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-[#1FA6DD]" />
                                        Add Funds to Wallet
                                    </h3>
                                    <button onClick={() => setShowTopUpModal(false)} className="text-gray-400 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Enter Amount (₹)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-gray-500 text-xl font-medium">₹</span>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-9 pr-4 py-4 bg-white border border-gray-200 hover:border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1FA6DD]/10 focus:border-[#1FA6DD] text-2xl font-bold text-gray-900 transition-all shadow-inner"
                                                value={topUpAmount}
                                                onChange={(e) => setTopUpAmount(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            {['5000', '10000', '25000', '50000'].map((amt) => (
                                                <button
                                                    key={amt}
                                                    onClick={() => setTopUpAmount(amt)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${topUpAmount === amt ? 'bg-blue-50 border-[#1FA6DD] text-[#1FA6DD]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    +₹{Number(amt).toLocaleString('en-IN')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm">
                                        <Shield className="w-5 h-5 text-[#1FA6DD] flex-shrink-0 mt-0.5" />
                                        <div className="text-gray-700">
                                            <p className="font-bold text-gray-900 mb-1">Instant Settlement via Razorpay</p>
                                            <p className="text-xs font-medium text-gray-600 leading-relaxed">Top-ups via UPI or NetBanking reflect immediately in your Active Balance.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50">
                                    <button
                                        onClick={() => setShowTopUpModal(false)}
                                        className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 border border-transparent rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleTopUp}
                                        className={`flex-[2] py-3 text-sm font-bold text-white rounded-xl transition-all shadow-md ${topUpAmount && Number(topUpAmount) > 0 ? 'bg-[#1FA6DD] hover:bg-[#1889B6] hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                                        disabled={!topUpAmount || Number(topUpAmount) <= 0}
                                    >
                                        Proceed to Pay
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
