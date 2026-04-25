'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { Event } from '@/types';
import api from '@/lib/api';

const DEPT_COLORS: Record<string, string> = {
    'Computer Science': 'bg-blue-500',
    'Electronics': 'bg-purple-500',
    'Mechanical': 'bg-orange-500',
    'Civil': 'bg-yellow-500',
    'Cultural Clubs': 'bg-pink-500',
    'Management': 'bg-green-500',
    'Science': 'bg-teal-500',
    'Other': 'bg-gray-500',
};

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/events?limit=100');
                setEvents(data.events);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start with empty days
    const startPadding = getDay(monthStart); // 0=Sun
    const gridDays = [...Array(startPadding).fill(null), ...days];

    const getEventsForDay = (date: Date) =>
        events.filter((e) => isSameDay(new Date(e.date), date));

    const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: '#0c2d48' }}>Event Calendar</h1>
                <p style={{ color: '#1a4a6b' }}>Monthly view of all university events</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <div className="rounded-3xl border border-white/40 shadow-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)' }}>
                        {/* Month navigation */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                            <button
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <button
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 border-b border-gray-50">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="animate-spin text-gray-300" size={28} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-7">
                                {gridDays.map((day, i) => {
                                    if (!day) {
                                        return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-50" />;
                                    }
                                    const dayEvents = getEventsForDay(day);
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const today = isToday(day);

                                    return (
                                        <motion.div
                                            key={day.toISOString()}
                                            whileHover={{ backgroundColor: '#f9fafb' }}
                                            onClick={() => setSelectedDate(isSelected ? null : day)}
                                            className={`min-h-[80px] p-2 border-b border-r border-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-100' : ''
                                                }`}
                                        >
                                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${today ? 'bg-gray-900 text-white' : isSelected ? 'bg-blue-600 text-white' : 'text-gray-700'
                                                }`}>
                                                {format(day, 'd')}
                                            </div>
                                            <div className="space-y-0.5">
                                                {dayEvents.slice(0, 2).map((e) => (
                                                    <div
                                                        key={e._id}
                                                        className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded truncate ${DEPT_COLORS[e.department] || 'bg-gray-500'}`}
                                                    >
                                                        {e.title}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 2 && (
                                                    <div className="text-[10px] text-gray-400 font-medium pl-1">
                                                        +{dayEvents.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-3">
                        {Object.entries(DEPT_COLORS).slice(0, 5).map(([dept, color]) => (
                            <div key={dept} className="flex items-center gap-1.5">
                                <span className={`w-3 h-3 rounded-full ${color}`} />
                                <span className="text-xs text-gray-500">{dept}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Date Panel */}
                <div>
                    <div className="rounded-3xl border border-white/40 shadow-sm p-6 sticky top-24" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)' }}>
                        {selectedDate ? (
                            <>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {format(selectedDate, 'EEEE, MMMM d')}
                                </h3>
                                <p className="text-xs text-gray-400 mb-5">
                                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
                                </p>

                                {selectedDateEvents.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-8">No events on this day</p>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedDateEvents.map((e) => (
                                            <Link key={e._id} href={`/events/${e._id}`}>
                                                <div className="group p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                                                    <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${DEPT_COLORS[e.department]?.replace('bg-', 'text-') || 'text-gray-500'
                                                        }`}>
                                                        {e.department} · {e.eventType}
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                                        {e.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{format(new Date(e.date), 'h:mm a')} · {e.venue}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">📅</span>
                                </div>
                                <p className="text-sm text-gray-500">Click a date to see events</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
