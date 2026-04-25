'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, MapPin, Building2, ExternalLink,
    ArrowLeft, Tag, CheckCircle2, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/types';
import api from '@/lib/api';

const DEPT_COLORS: Record<string, string> = {
    'Computer Science': 'bg-blue-50 text-blue-700 border-blue-100',
    'Electronics': 'bg-purple-50 text-purple-700 border-purple-100',
    'Mechanical': 'bg-orange-50 text-orange-700 border-orange-100',
    'Civil': 'bg-yellow-50 text-yellow-700 border-yellow-100',
    'Cultural Clubs': 'bg-pink-50 text-pink-700 border-pink-100',
    'Management': 'bg-green-50 text-green-700 border-green-100',
    'Science': 'bg-teal-50 text-teal-700 border-teal-100',
    'Other': 'bg-gray-50 text-gray-700 border-gray-100',
};

interface Props { params: Promise<{ id: string }> }

export default function EventDetailPage({ params }: Props) {
    const { id } = use(params);
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch {
                setError('Event not found');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-gray-300" size={40} />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="text-center py-32">
                <p className="text-gray-400 text-lg mb-4">{error || 'Event not found'}</p>
                <Link href="/events" className="text-blue-600 hover:underline text-sm">← Back to Events</Link>
            </div>
        );
    }

    const isPast = event.status === 'completed';
    const colorClass = DEPT_COLORS[event.department] || 'bg-gray-50 text-gray-700 border-gray-100';
    const eventDate = new Date(event.date);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Back */}
            <Link href="/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors group">
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Events
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Left: Poster + quick info */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Poster */}
                        <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-gray-100 shadow-sm">
                            {event.poster ? (
                                <Image
                                    src={event.poster}
                                    alt={event.title}
                                    fill
                                    className={`object-cover ${isPast ? 'grayscale-[20%]' : ''}`}
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                    <Calendar size={48} className="text-gray-200" />
                                </div>
                            )}
                            {isPast && (
                                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-600 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    Completed
                                </div>
                            )}
                        </div>

                        {/* Quick details card */}
                        <div className="rounded-2xl p-5 shadow-sm space-y-4" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                            <div className="flex items-start gap-3">
                                <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {format(eventDate, 'EEEE, MMMM d, yyyy')}
                                    </p>
                                    {event.endDate && (
                                        <p className="text-xs text-gray-500">to {format(new Date(event.endDate), 'MMMM d, yyyy')}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Time</p>
                                    <p className="text-sm font-semibold text-gray-900">{format(eventDate, 'h:mm a')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Venue</p>
                                    <p className="text-sm font-semibold text-gray-900">{event.venue}</p>
                                </div>
                            </div>
                        </div>

                        {/* Registration CTA */}
                        {event.registrationLink && !isPast && (
                            <a
                                href={event.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-2xl hover:bg-gray-700 transition-all shadow-sm"
                            >
                                Register Now <ExternalLink size={14} />
                            </a>
                        )}
                    </div>

                    {/* Right: Title + description */}
                    <div className="lg:col-span-3">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${colorClass}`}>
                                {event.department}
                            </span>
                            <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                                {event.eventType}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-6" style={{ color: '#0c2d48' }}>
                            {event.title}
                        </h1>

                        {/* Description */}
                        <div className="prose prose-gray max-w-none">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">About this Event</h3>
                            <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </div>
                        </div>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className="mt-8">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag size={13} className="text-gray-400" />
                                    {event.tags.map((tag) => (
                                        <Link
                                            key={tag}
                                            href={`/events?search=${encodeURIComponent(tag)}`}
                                            className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Posted date */}
                        <p className="text-xs text-gray-400 mt-8 pt-6 border-t border-gray-100">
                            Posted on {format(new Date(event.createdAt), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
