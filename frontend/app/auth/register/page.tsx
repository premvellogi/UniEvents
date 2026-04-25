'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail, User, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
    'Computer Science', 'Electronics', 'Mechanical', 'Civil',
    'Cultural Clubs', 'Management', 'Science', 'Other'
];

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.department);
            toast.success('Account created! Welcome to UniEvents 🎉');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed.');
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
                <div className="glass-white rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl items-center justify-center mb-4 shadow-sm">
                            <span className="text-white font-bold text-2xl">U</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create account</h1>
                        <p className="text-sm text-gray-500 mt-1">Register with your university email</p>
                    </div>

                    {/* Domain notice */}
                    <div className="mb-6 p-3.5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2">
                        <Mail size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 font-medium">
                            Only <span className="font-bold">@jainuniversity.ac.in</span> email addresses are accepted for registration.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">University Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@jainuniversity.ac.in"
                                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                            <div className="relative">
                                <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors text-gray-900 bg-white"
                                >
                                    <option value="">Select department (optional)</option>
                                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="password"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors text-gray-900"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-gray-900 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
