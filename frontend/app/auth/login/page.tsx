'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login(email, password);
            toast.success('Welcome back!');
            // Admins go to admin portal, students go to events
            if (userData?.role === 'secondary_admin' || userData?.role === 'superior_admin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="glass-white rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl items-center justify-center mb-4 shadow-sm">
                            <span className="text-white font-bold text-2xl">U</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                        <p className="text-sm text-gray-500 mt-1">Sign in to your UniEvents account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@university.edu"
                                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors text-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
                        </button>
                    </form>


                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="text-gray-900 font-semibold hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
