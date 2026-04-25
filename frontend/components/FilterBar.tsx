'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Cultural Clubs', 'Management', 'Science', 'Other'];
const EVENT_TYPES = ['Workshop', 'Seminar', 'Hackathon', 'Fest', 'Sports', 'Academic', 'Cultural', 'Other'];

interface FilterBarProps {
    onFilterChange: (filters: {
        search?: string;
        department?: string;
        eventType?: string;
        status?: string;
    }) => void;
    initialFilters?: Record<string, string>;
}

export default function FilterBar({ onFilterChange, initialFilters = {} }: FilterBarProps) {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [department, setDepartment] = useState(initialFilters.department || '');
    const [eventType, setEventType] = useState(initialFilters.eventType || '');
    const [status, setStatus] = useState(initialFilters.status || '');
    const [mobileOpen, setMobileOpen] = useState(false);

    const apply = (overrides: Record<string, string> = {}) => {
        const merged = { search, department, eventType, status, ...overrides };
        onFilterChange({
            search: merged.search || undefined,
            department: merged.department || undefined,
            eventType: merged.eventType || undefined,
            status: merged.status || undefined,
        });
    };

    const clearAll = () => {
        setSearch(''); setDepartment(''); setEventType(''); setStatus('');
        onFilterChange({});
    };

    const hasFilters = search || department || eventType || status;
    const activeCount = [department, eventType, status].filter(Boolean).length;

    return (
        <div className="space-y-3">
            {/* Search + filter toggle row */}
            <div className="flex items-center gap-3">
                <form
                    onSubmit={(e) => { e.preventDefault(); apply(); }}
                    className="flex-1 flex items-center gap-2 bg-white/75 backdrop-blur-sm border border-white/50 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-sky-300 transition-all"
                >
                    <Search size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); if (!e.target.value) apply({ search: '' }); }}
                        placeholder="Search events..."
                        className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
                    />
                    {search && (
                        <button type="button" onClick={() => { setSearch(''); apply({ search: '' }); }}>
                            <X size={14} className="text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Search
                    </button>
                </form>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${mobileOpen ? 'bg-gray-900 text-white border-gray-900' : 'bg-white/75 backdrop-blur-sm border-white/50 text-gray-700 hover:border-sky-300'
                        }`}
                >
                    <SlidersHorizontal size={15} />
                    Filters
                    {activeCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>

                {hasFilters && (
                    <button onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors whitespace-nowrap">
                        <X size={13} /> Clear
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/85 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-sm overflow-hidden"
                    >
                        {/* Status */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                            <div className="flex gap-2">
                                {['', 'upcoming', 'completed'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setStatus(s); apply({ status: s }); }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${status === s ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Department</label>
                            <select
                                value={department}
                                onChange={(e) => { setDepartment(e.target.value); apply({ department: e.target.value }); }}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white outline-none focus:border-gray-400"
                            >
                                <option value="">All Departments</option>
                                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Event Type */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Event Type</label>
                            <select
                                value={eventType}
                                onChange={(e) => { setEventType(e.target.value); apply({ eventType: e.target.value }); }}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white outline-none focus:border-gray-400"
                            >
                                <option value="">All Types</option>
                                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active filter chips */}
            {activeCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    {department && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                            {department}
                            <button onClick={() => { setDepartment(''); apply({ department: '' }); }}><X size={11} /></button>
                        </span>
                    )}
                    {eventType && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
                            {eventType}
                            <button onClick={() => { setEventType(''); apply({ eventType: '' }); }}><X size={11} /></button>
                        </span>
                    )}
                    {status && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <button onClick={() => { setStatus(''); apply({ status: '' }); }}><X size={11} /></button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
