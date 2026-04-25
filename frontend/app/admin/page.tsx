'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Plus, Edit3, Trash2, BarChart3,
    Loader2, Star, CheckCircle2, Clock, Users, Calendar,
    Send, AlertCircle, UserCog
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Event } from '@/types';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Cultural Clubs', 'Management', 'Science', 'Other'];
const EVENT_TYPES = ['Workshop', 'Seminar', 'Hackathon', 'Fest', 'Sports', 'Academic', 'Cultural', 'Other'];

const emptyForm = {
    title: '', description: '', department: 'Computer Science', eventType: 'Workshop',
    date: '', endDate: '', venue: '', registrationLink: '', status: 'upcoming',
    featured: false, tags: '',
};

export default function AdminDashboard() {
    const { isAdmin, isSuperiorAdmin, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState<'overview' | 'events' | 'create' | 'broadcast' | 'admins'>('overview');
    const [events, setEvents] = useState<Event[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [recentBroadcasts, setRecentBroadcasts] = useState<string[]>([]);
    
    // Admin management state
    const [secondaryAdmins, setSecondaryAdmins] = useState<any[]>([]);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
    const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
    const [adminLoading, setAdminLoading] = useState(false);

    // Confirmation modal state
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'event' | 'admin'; id: string } | null>(null);

    useEffect(() => {
        if (!authLoading && !isAdmin) router.replace('/auth/login');
    }, [authLoading, isAdmin]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [evRes, analyticsRes] = await Promise.all([
                api.get('/events?limit=50'),
                api.get('/events/admin/analytics'),
            ]);
            setEvents(evRes.data.events);
            setAnalytics(analyticsRes.data);
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { if (isAdmin) loadData(); }, [isAdmin]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm((p) => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };

    const handlePoster = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPosterFile(file);
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const openEdit = (ev: Event) => {
        setEditId(ev._id);
        setForm({
            title: ev.title,
            description: ev.description,
            department: ev.department,
            eventType: ev.eventType,
            date: ev.date.slice(0, 16),
            endDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
            venue: ev.venue,
            registrationLink: ev.registrationLink || '',
            status: ev.status,
            featured: ev.featured,
            tags: ev.tags?.join(', ') || '',
        });
        setPosterPreview(ev.poster || '');
        setPosterFile(null);
        setTab('create');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
            if (posterFile) fd.append('poster', posterFile);

            if (editId) {
                await api.put(`/events/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Event updated!');
            } else {
                await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Event created! Students notified 🎉');
            }

            setForm(emptyForm);
            setPosterFile(null);
            setPosterPreview('');
            setEditId(null);
            setTab('events');
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save event');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        setConfirmDelete({ type: 'event', id });
    };

    const executeDeleteEvent = async (id: string) => {
        try {
            await api.delete(`/events/${id}`);
            toast.success('Event deleted');
            loadData();
        } catch {
            toast.error('Failed to delete event');
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await api.post('/notifications/broadcast', { message: broadcastMsg });
            toast.success(data.message);
            setRecentBroadcasts((prev) => [broadcastMsg, ...prev].slice(0, 5));
            setBroadcastMsg('');
        } catch {
            toast.error('Failed to send broadcast');
        } finally {
            setSubmitting(false);
        }
    };

    // Admin management functions
    const loadSecondaryAdmins = async () => {
        try {
            const { data } = await api.get('/admin/secondary-admins');
            setSecondaryAdmins(data);
        } catch (error) {
            console.error('Failed to load secondary admins:', error);
            toast.error('Failed to load secondary admins');
        }
    };

    const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAdminForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdminLoading(true);
        try {
            if (editingAdmin) {
                await api.put(`/admin/secondary-admins/${editingAdmin}`, adminForm);
                toast.success('Secondary admin updated successfully');
            } else {
                await api.post('/admin/secondary-admins', adminForm);
                toast.success('Secondary admin created successfully');
            }
            setAdminForm({ name: '', email: '', password: '' });
            setEditingAdmin(null);
            loadSecondaryAdmins();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save admin');
        } finally {
            setAdminLoading(false);
        }
    };

    const handleEditAdmin = (admin: any) => {
        setEditingAdmin(admin._id);
        setAdminForm({
            name: admin.name,
            email: admin.email,
            password: ''
        });
    };

    const handleDeleteAdmin = (id: string) => {
        setConfirmDelete({ type: 'admin', id });
    };

    const executeDeleteAdmin = async (id: string) => {
        try {
            await api.delete(`/admin/secondary-admins/${id}`);
            toast.success('Secondary admin deleted successfully');
            loadSecondaryAdmins();
        } catch (error) {
            toast.error('Failed to delete admin');
        }
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        if (confirmDelete.type === 'event') {
            await executeDeleteEvent(confirmDelete.id);
        } else {
            await executeDeleteAdmin(confirmDelete.id);
        }
        setConfirmDelete(null);
    };

    const resetAdminForm = () => {
        setAdminForm({ name: '', email: '', password: '' });
        setEditingAdmin(null);
    };

    useEffect(() => {
        if (isSuperiorAdmin && tab === 'admins') {
            loadSecondaryAdmins();
        }
    }, [isSuperiorAdmin, tab]);

    if (authLoading || !isAdmin) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-gray-300" size={36} /></div>;
    }

    const statCards = analytics ? [
        { label: 'Total Events', value: analytics.total, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
        { label: 'Upcoming', value: analytics.upcoming, icon: Clock, color: 'bg-green-50 text-green-600' },
        { label: 'Completed', value: analytics.completed, icon: CheckCircle2, color: 'bg-gray-50 text-gray-600' },
        { label: 'Featured', value: analytics.featured, icon: Star, color: 'bg-amber-50 text-amber-600' },
        { label: 'Students', value: analytics.students, icon: Users, color: 'bg-purple-50 text-purple-600' },
    ] : [];

    const navItems = [
        { key: 'overview', label: 'Overview', icon: BarChart3 },
        { key: 'events', label: 'Events', icon: Calendar },
        { key: 'create', label: editId ? 'Edit Event' : 'Create Event', icon: Plus },
        { key: 'broadcast', label: 'Broadcast', icon: Send },
        ...(isSuperiorAdmin ? [{ key: 'admins', label: 'Manage Admins', icon: UserCog }] : []),
    ];

    return (
        <div className="min-h-screen">
            {/* Admin Header */}
            <div style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.25)' }} className="sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 overflow-x-auto py-1">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => { setTab(item.key as any); if (item.key !== 'create') { setEditId(null); setForm(emptyForm); setPosterPreview(''); } }}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${tab === item.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                <item.icon size={15} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* OVERVIEW */}
                {tab === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
                        {loading ? (
                            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-gray-300" size={32} /></div>
                        ) : (
                            <>
                                {/* Stat Cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                                    {statCards.map((s) => (
                                        <div key={s.label} className="rounded-2xl p-5 shadow-sm" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                                                <s.icon size={18} />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Events by Department */}
                                    <div className="rounded-2xl shadow-sm p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                        <h3 className="font-semibold text-gray-900 mb-4">Events by Department</h3>
                                        <div className="space-y-3">
                                            {analytics?.byDepartment?.map((d: any) => (
                                                <div key={d._id} className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-700 w-36 truncate">{d._id}</span>
                                                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                                            style={{ width: `${Math.round((d.count / analytics.total) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-600 w-6 text-right">{d.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Events */}
                                    <div className="rounded-2xl shadow-sm p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                        <h3 className="font-semibold text-gray-900 mb-4">Recent Events</h3>
                                        <div className="space-y-3">
                                            {analytics?.recent?.map((e: Event) => (
                                                <div key={e._id} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                                                        <p className="text-xs text-gray-400">{e.department} · {format(new Date(e.date), 'MMM d')}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${e.status === 'upcoming' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {e.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Students + Recent Broadcasts row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Students Panel */}
                                    <div className="rounded-2xl shadow-sm p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                                                <Users size={16} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Registered Students</h3>
                                                <p className="text-xs text-gray-400">@jainuniversity.ac.in accounts</p>
                                            </div>
                                        </div>
                                        <p className="text-4xl font-bold text-gray-900 mb-1">{analytics?.students ?? '–'}</p>
                                        <p className="text-sm text-gray-500">Total enrolled students</p>
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs text-gray-500">Students can register with a <span className="font-semibold text-gray-700">@jainuniversity.ac.in</span> email and browse all campus events.</p>
                                        </div>
                                    </div>

                                    {/* Recent Broadcasts */}
                                    <div className="rounded-2xl shadow-sm p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                                                <Send size={16} className="text-amber-600" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Recent Broadcasts</h3>
                                        </div>
                                        {recentBroadcasts.length === 0 ? (
                                            <p className="text-sm text-gray-400 py-4 text-center">No broadcasts sent this session.<br /><span className="text-xs">Use the Broadcast tab to notify all students.</span></p>
                                        ) : (
                                            <div className="space-y-2">
                                                {recentBroadcasts.map((msg, i) => (
                                                    <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                        <Send size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs text-amber-800">{msg}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setTab('broadcast')}
                                            className="mt-4 w-full py-2.5 text-xs font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-all"
                                        >
                                            + New Broadcast
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* EVENTS LIST */}
                {tab === 'events' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
                            <button
                                onClick={() => { setEditId(null); setForm(emptyForm); setPosterPreview(''); setTab('create'); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all"
                            >
                                <Plus size={15} /> New Event
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-gray-300" size={32} /></div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                                <p>No events yet. Create your first event!</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Event</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4 hidden sm:table-cell">Dept</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Date</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Status</th>
                                                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {events.map((ev) => (
                                                <tr key={ev._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {ev.poster && (
                                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                                    <Image src={ev.poster} alt="" fill className="object-cover" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">{ev.title}</p>
                                                                <p className="text-xs text-gray-400">{ev.eventType}</p>
                                                            </div>
                                                            {ev.featured && <Star size={12} className="text-amber-500 fill-amber-400 flex-shrink-0" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 hidden sm:table-cell">
                                                        <span className="text-xs text-gray-600">{ev.department}</span>
                                                    </td>
                                                    <td className="px-4 py-4 hidden md:table-cell">
                                                        <span className="text-xs text-gray-600">{format(new Date(ev.date), 'MMM d, yyyy')}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ev.status === 'upcoming' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {ev.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openEdit(ev)}
                                                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit3 size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(ev._id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* CREATE / EDIT FORM */}
                {tab === 'create' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">{editId ? 'Edit Event' : 'Create New Event'}</h1>

                        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl shadow-sm p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title *</label>
                                <input name="title" value={form.title} onChange={handleFormChange} required
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900" placeholder="e.g. National Hackathon 2026" />
                            </div>

                            {/* Row: Dept + Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Department *</label>
                                    <select name="department" value={form.department} onChange={handleFormChange} required
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-700 bg-white">
                                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Type *</label>
                                    <select name="eventType" value={form.eventType} onChange={handleFormChange} required
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-700 bg-white">
                                        {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Row: Date + End Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date & Time *</label>
                                    <input type="datetime-local" name="date" value={form.date} onChange={handleFormChange} required
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date & Time</label>
                                    <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleFormChange}
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-700" />
                                </div>
                            </div>

                            {/* Venue */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue *</label>
                                <input name="venue" value={form.venue} onChange={handleFormChange} required
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900" placeholder="e.g. Main Auditorium" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                                <textarea name="description" value={form.description} onChange={handleFormChange} required rows={5}
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900 resize-none" placeholder="Describe the event..." />
                            </div>

                            {/* Registration Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Registration Link</label>
                                <input name="registrationLink" value={form.registrationLink} onChange={handleFormChange} type="url"
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900" placeholder="https://..." />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
                                <input name="tags" value={form.tags} onChange={handleFormChange}
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900" placeholder="hackathon, coding, prize" />
                            </div>

                            {/* Status + Featured */}
                            <div className="flex items-center gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                                    <select name="status" value={form.status} onChange={handleFormChange}
                                        className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-700 bg-white">
                                        <option value="upcoming">Upcoming</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 mt-5">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        name="featured"
                                        checked={Boolean(form.featured)}
                                        onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                                        className="w-4 h-4 rounded accent-gray-900"
                                    />
                                    <label htmlFor="featured" className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                                        <Star size={13} className="text-amber-500" /> Mark as Featured
                                    </label>
                                </div>
                            </div>

                            {/* Poster Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Poster</label>
                                <input type="file" accept="image/*" onChange={handlePoster}
                                    className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:border-0 file:rounded-lg file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                {posterPreview && (
                                    <div className="mt-3 relative w-40 h-24 rounded-xl overflow-hidden border border-gray-100">
                                        <Image src={posterPreview} alt="Preview" fill className="object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editId ? 'Save Changes' : 'Create Event')}
                                </button>
                                {editId && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditId(null); setForm(emptyForm); setPosterPreview(''); setTab('events'); }}
                                        className="px-6 py-3.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* BROADCAST */}
                {tab === 'broadcast' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Broadcast Notification</h1>
                        <p className="text-gray-500 text-sm mb-6">Send a custom notification to all registered students.</p>

                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                            <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-700">This will immediately send a notification to all students on the platform.</p>
                        </div>

                        <form onSubmit={handleBroadcast} className="rounded-2xl shadow-sm p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                                <textarea
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    required rows={4}
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900 resize-none"
                                    placeholder="e.g. Reminder: Registration for Hackathon closes tomorrow!"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || !broadcastMsg.trim()}
                                className="w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={15} /> Send to All Students</>}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* MANAGE ADMINS */}
                {tab === 'admins' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Manage Secondary Admins</h1>
                                <p className="text-gray-500 text-sm mt-1">Create and manage secondary admin accounts</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Admin Form */}
                            <div className="lg:col-span-1">
                                <div className="rounded-2xl shadow-sm p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                    <h3 className="font-semibold text-gray-900 mb-4">
                                        {editingAdmin ? 'Edit Secondary Admin' : 'Create Secondary Admin'}
                                    </h3>
                                    
                                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={adminForm.name}
                                                onChange={handleAdminFormChange}
                                                required
                                                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900"
                                                placeholder="Admin name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={adminForm.email}
                                                onChange={handleAdminFormChange}
                                                required
                                                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900"
                                                placeholder="admin@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Password {editingAdmin && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={adminForm.password}
                                                onChange={handleAdminFormChange}
                                                required={!editingAdmin}
                                                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-400 text-gray-900"
                                                placeholder={editingAdmin ? "New password (optional)" : "Password"}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={adminLoading}
                                                className="flex-1 py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                                            >
                                                {adminLoading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editingAdmin ? 'Update Admin' : 'Create Admin')}
                                            </button>
                                            {editingAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={resetAdminForm}
                                                    className="px-6 py-3.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Admins List */}
                            <div className="lg:col-span-2">
                                <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900">Secondary Admins ({secondaryAdmins.length})</h3>
                                    </div>
                                    
                                    {secondaryAdmins.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <UserCog size={40} className="mx-auto mb-3 opacity-30" />
                                            <p>No secondary admins yet</p>
                                            <p className="text-sm mt-1">Create your first secondary admin to get started</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Admin</th>
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Email</th>
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Role</th>
                                                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Created</th>
                                                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {secondaryAdmins.map((admin) => (
                                                        <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                                                        <UserCog size={16} className="text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
                                                                        <p className="text-xs text-gray-400">ID: {admin._id.slice(-8)}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="text-sm text-gray-600">{admin.email}</span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                                                    {admin.role.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="text-xs text-gray-600">
                                                                    {format(new Date(admin.createdAt), 'MMM d, yyyy')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleEditAdmin(admin)}
                                                                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit3 size={15} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteAdmin(admin._id)}
                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
                        onClick={() => setConfirmDelete(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                    <Trash2 size={18} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {confirmDelete.type === 'event' ? 'Delete Event' : 'Delete Admin'}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">
                                {confirmDelete.type === 'event'
                                    ? 'Are you sure you want to delete this event? This action cannot be undone.'
                                    : 'Are you sure you want to delete this secondary admin? This action cannot be undone.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-3 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
