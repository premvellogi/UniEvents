'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/events?search=${encodeURIComponent(query.trim())}`);
        } else {
            router.push('/events');
        }
    };

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Website content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Badge — white bg with cyan text & border */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
                        style={{
                            background: '#ffffff',
                            color: '#0ea5d4',
                            border: '1px solid #0ea5d4',
                        }}
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#0ea5d4' }} />
                        Your campus, connected
                    </div>

                    {/* Headline — dark navy */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
                        style={{ color: '#0c2d48' }}
                    >
                        Never miss an
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            amazing event.
                        </span>
                    </h1>

                    {/* Subheading — readable blue-navy */}
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                        style={{ color: '#1a4a6b' }}
                    >
                        Discover workshops, hackathons, seminars, and fests happening at your university — all in one place.
                    </p>

                    {/* Search Bar — white bg, dark navy placeholder */}
                    <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-8">
                        <div className="flex items-center rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            style={{
                                background: 'rgba(255, 255, 255, 0.85)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                            }}
                        >
                            <Search size={18} className="ml-4 flex-shrink-0" style={{ color: '#0c2d48' }} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search events, workshops, hackathons..."
                                className="flex-1 px-3 py-4 text-sm outline-none bg-transparent"
                                style={{ color: '#0c2d48' }}
                            />
                            <button
                                type="submit"
                                className="m-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Quick filters — frosted glass tags with dark navy text */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {['Hackathon', 'Workshop', 'Seminar', 'Fest', 'Sports'].map((type) => (
                            <Link
                                key={type}
                                href={`/events?eventType=${type}`}
                                className="px-4 py-1.5 text-sm font-medium rounded-full transition-colors hover:bg-white/50"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    color: '#0c2d48',
                                    border: '1px solid rgba(255, 255, 255, 0.6)',
                                }}
                            >
                                {type}
                            </Link>
                        ))}
                    </div>
                    {/* Scroll indicator — below the category chips */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="mt-8 flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="flex flex-col items-center gap-1"
                        >
                            <span className="text-xs tracking-widest uppercase" style={{ color: '#1a4a6b' }}>Explore</span>
                            <ChevronRight size={14} className="rotate-90" style={{ color: '#1a4a6b' }} />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
