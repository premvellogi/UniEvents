'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAdmin, isAuthenticated } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications?limit=8');
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch { }
    };

    const markRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch { }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/events', label: 'Events' },
        { href: '/calendar', label: 'Calendar' },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'shadow-md'
                        : ''
                    }`}
                style={{
                    background: scrolled ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <span className="text-white font-bold text-sm">U</span>
                            </div>
                            <span className="font-semibold text-lg tracking-tight" style={{ color: '#0c2d48' }}>UniEvents</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${pathname === link.href
                                            ? 'bg-white/30'
                                            : 'hover:bg-white/20'
                                        }`}
                                    style={{ color: '#0c2d48' }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 rounded-full hover:bg-white/20 transition-all"
                                aria-label="Search"
                                style={{ color: '#0c2d48' }}
                            >
                                <Search size={18} />
                            </button>

                            {isAuthenticated ? (
                                <>
                                    {/* Notification Bell */}
                                    <div className="relative" ref={notifRef}>
                                        <button
                                            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                                            className="relative p-2 rounded-full hover:bg-white/20 transition-all"
                                            style={{ color: '#0c2d48' }}
                                            aria-label="Notifications"
                                        >
                                            <Bell size={18} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {notifOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                                                >
                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                                                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                                                Mark all read
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="max-h-72 overflow-y-auto">
                                                        {notifications.length === 0 ? (
                                                            <p className="text-center text-gray-400 text-sm py-8">No notifications yet</p>
                                                        ) : (
                                                            notifications.map((n) => (
                                                                <div
                                                                    key={n._id}
                                                                    onClick={() => {
                                                                        if (!n.read) markRead(n._id);
                                                                        if (n.eventId) router.push(`/events/${typeof n.eventId === 'object' ? n.eventId._id : n.eventId}`);
                                                                        setNotifOpen(false);
                                                                    }}
                                                                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50/50' : ''
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        {!n.read && <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                                                                        <div className={!n.read ? '' : 'pl-5'}>
                                                                            <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* User Menu */}
                                    <div className="relative" ref={userMenuRef}>
                                        <button
                                            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/20 transition-all"
                                        >
                                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-semibold text-xs">{user?.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <span className="text-sm font-medium hidden sm:block" style={{ color: '#0c2d48' }}>{user?.name.split(' ')[0]}</span>
                                            <ChevronDown size={14} style={{ color: '#0c2d48' }} />
                                        </button>

                                        <AnimatePresence>
                                            {userMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1 z-50"
                                                >
                                                    <div className="px-4 py-3 border-b border-gray-50">
                                                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                                    </div>
                                                    {isAdmin && (
                                                        <div
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                            onPointerDown={(e) => {
                                                                e.preventDefault();
                                                                setUserMenuOpen(false);
                                                                router.push('/admin');
                                                            }}
                                                        >
                                                            <LayoutDashboard size={15} className="text-gray-400" />
                                                            Admin Dashboard
                                                        </div>
                                                    )}
                                                    <div
                                                        onPointerDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setUserMenuOpen(false);
                                                            logout();
                                                            router.push('/');
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                    >
                                                        <LogOut size={15} />
                                                        Sign Out
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link
                                        href="/auth/login"
                                        className="px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/20"
                                        style={{ color: '#0c2d48' }}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-700 transition-all shadow-sm"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-full hover:bg-white/20 transition-all"
                                style={{ color: '#0c2d48' }}
                            >
                                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/20"
                            style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
                        >
                            <div className="px-4 py-4 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === link.href ? 'bg-white/30' : ''
                                            }`}
                                        style={{ color: '#0c2d48' }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                {!isAuthenticated && (
                                    <div className="flex gap-2 pt-2">
                                        <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-700">Sign In</Link>
                                        <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold bg-gray-900 rounded-xl text-white">Register</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Search Modal */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.96 }}
                            className="w-full max-w-lg rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(255, 255, 255, 0.85)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.25)',
                                border: '1.5px solid rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
                                <Search size={20} className="text-gray-400 flex-shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search events by name, department, type..."
                                    className="flex-1 text-base text-gray-900 outline-none placeholder-gray-400"
                                />
                                <button type="button" onClick={() => setSearchOpen(false)}>
                                    <X size={18} className="text-gray-400 hover:text-gray-600" />
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
