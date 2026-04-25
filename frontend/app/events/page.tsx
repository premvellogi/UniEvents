'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, LayoutGrid, List, Calendar } from 'lucide-react';
import EventCard from '@/components/EventCard';
import FilterBar from '@/components/FilterBar';
import { Event } from '@/types';
import api from '@/lib/api';
import { Suspense } from 'react';

const SkeletonCard = () => (
    <div className="bg-white/75 backdrop-blur-sm rounded-2xl border border-white/40 overflow-hidden">
        <div className="skeleton h-44 w-full" />
        <div className="p-4 space-y-3">
            <div className="skeleton h-4 w-1/3 rounded-full" />
            <div className="skeleton h-5 w-4/5 rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
        </div>
    </div>
);

function EventsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const initialFilters = {
        search: searchParams.get('search') || '',
        department: searchParams.get('department') || '',
        eventType: searchParams.get('eventType') || '',
        status: searchParams.get('status') || '',
    };

    const [filters, setFilters] = useState(initialFilters);

    const fetchEvents = useCallback(async (newFilters = filters, newPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (newFilters.search) params.set('search', newFilters.search);
            if (newFilters.department) params.set('department', newFilters.department);
            if (newFilters.eventType) params.set('eventType', newFilters.eventType);
            if (newFilters.status) params.set('status', newFilters.status);
            params.set('page', String(newPage));
            params.set('limit', '12');

            const { data } = await api.get(`/events?${params.toString()}`);
            setEvents(data.events);
            setTotal(data.total);
            setPages(data.pages);
            setPage(data.page);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchEvents(filters, 1);
    }, []);

    const handleFilterChange = (newFilters: Record<string, string | undefined>) => {
        const merged = { ...filters, ...newFilters };
        setFilters(merged as typeof filters);
        setPage(1);
        fetchEvents(merged as typeof filters, 1);
    };

    const currentStatus = filters.status || 'all';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: '#0c2d48' }}>Events</h1>
                <p style={{ color: '#1a4a6b' }}>Browse all university events, workshops, seminars, and more</p>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                {[
                    { value: '', label: 'All Events' },
                    { value: 'upcoming', label: '📅 Upcoming' },
                    { value: 'completed', label: '✅ Past Events' },
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => handleFilterChange({ status: tab.value })}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${currentStatus === (tab.value || 'all') || (tab.value === '' && currentStatus === 'all')
                                ? 'bg-sky-700/90 text-white shadow-sm'
                                : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-1">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-8">
                <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />
            </div>

            {/* Results count */}
            <p className="text-sm mb-6" style={{ color: '#1a4a6b' }}>
                {loading ? 'Loading...' : `${total} event${total !== 1 ? 's' : ''} found`}
            </p>

            {/* Events Grid/List */}
            {loading ? (
                <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-3xl mb-4">
                        <Calendar size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No events found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
                </div>
            ) : view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((e, i) => (
                        <motion.div
                            key={e._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.3 }}
                        >
                            <EventCard event={e} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 divide-y divide-gray-50/80 overflow-hidden">
                    {events.map((e) => (
                        <EventCard key={e._id} event={e} variant="compact" />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                        onClick={() => { const np = page - 1; setPage(np); fetchEvents(filters, np); }}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl disabled:opacity-40 hover:bg-white/90 transition-colors"
                    >
                        ← Previous
                    </button>
                    <span className="text-sm text-gray-500">Page {page} of {pages}</span>
                    <button
                        onClick={() => { const np = page + 1; setPage(np); fetchEvents(filters, np); }}
                        disabled={page === pages}
                        className="px-4 py-2 text-sm font-medium bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl disabled:opacity-40 hover:bg-white/90 transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

export default function EventsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-gray-300" size={36} /></div>}>
            <EventsContent />
        </Suspense>
    );
}
