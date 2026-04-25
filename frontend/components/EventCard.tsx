'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Building2, Clock, ArrowRight, Star } from 'lucide-react';
import { Event } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';

const DEPT_COLORS: Record<string, string> = {
    'Computer Science': 'bg-blue-100 text-blue-700',
    'Electronics': 'bg-purple-100 text-purple-700',
    'Mechanical': 'bg-orange-100 text-orange-700',
    'Civil': 'bg-yellow-100 text-yellow-700',
    'Cultural Clubs': 'bg-pink-100 text-pink-700',
    'Management': 'bg-green-100 text-green-700',
    'Science': 'bg-teal-100 text-teal-700',
    'Other': 'bg-gray-100 text-gray-700',
};

const TYPE_ICONS: Record<string, string> = {
    'Workshop': '🛠',
    'Seminar': '🎓',
    'Hackathon': '⚡',
    'Fest': '🎉',
    'Sports': '🏆',
    'Academic': '📚',
    'Cultural': '🎭',
    'Other': '📌',
};

interface EventCardProps {
    event: Event;
    variant?: 'default' | 'featured' | 'compact';
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
    const colorClass = DEPT_COLORS[event.department] || 'bg-gray-100 text-gray-700';
    const isPast = event.status === 'completed';

    if (variant === 'featured') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="group relative"
            >
                <Link href={`/events/${event._id}`}>
                    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100">
                        {event.poster ? (
                            <Image
                                src={event.poster}
                                alt={event.title}
                                fill
                                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isPast ? 'grayscale-[30%]' : ''}`}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <span className="text-6xl opacity-30">{TYPE_ICONS[event.eventType] || '📅'}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {event.featured && (
                            <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full text-xs font-bold">
                                <Star size={10} fill="currentColor" />
                                Featured
                            </div>
                        )}
                        {isPast && (
                            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
                                Completed
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
                                    {event.department}
                                </span>
                                <span className="text-xs font-semibold text-white/70">{event.eventType}</span>
                            </div>
                            <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{event.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-white/80">
                                <span className="flex items-center gap-1">
                                    <Calendar size={11} />
                                    {format(new Date(event.date), 'MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={11} />
                                    {event.venue}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    if (variant === 'compact') {
        return (
            <Link href={`/events/${event._id}`}>
                <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${colorClass.replace('text-', 'bg-').split(' ')[0]} bg-opacity-20`}>
                        {TYPE_ICONS[event.eventType] || '📅'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {format(new Date(event.date), 'MMM d')} · {event.venue}
                        </p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                </motion.div>
            </Link>
        );
    }

    // Default card
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-md hover:bg-white/90 transition-all duration-300 overflow-hidden"
        >
            <Link href={`/events/${event._id}`}>
                {/* Poster */}
                <div className="relative h-44 bg-gray-50 overflow-hidden">
                    {event.poster ? (
                        <Image
                            src={event.poster}
                            alt={event.title}
                            fill
                            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isPast ? 'grayscale-[20%]' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <span className="text-5xl opacity-20">{TYPE_ICONS[event.eventType] || '📅'}</span>
                        </div>
                    )}
                    {isPast && (
                        <div className="absolute inset-0 bg-gray-900/10" />
                    )}
                    {event.featured && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <Star size={9} fill="currentColor" /> Featured
                        </div>
                    )}
                    {isPast && (
                        <div className="absolute top-3 right-3 bg-white text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm border border-gray-100">
                            Completed
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${colorClass}`}>
                            {event.department}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">{event.eventType}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-3">
                        {event.title}
                    </h3>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                            <span>{format(new Date(event.date), 'EEEE, MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={12} className="text-gray-400 flex-shrink-0" />
                            <span>{format(new Date(event.date), 'h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{event.venue}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">By {event.createdBy?.name ?? 'Admin'}</span>
                    <div className="flex items-center gap-1 text-blue-600 text-xs font-medium group-hover:gap-2 transition-all">
                        View <ArrowRight size={12} />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
