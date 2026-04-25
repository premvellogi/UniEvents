import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-sky-950/30 backdrop-blur-xl border-t border-white/20 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">U</span>
                            </div>
                            <span className="font-semibold text-white text-lg tracking-tight">UniEvents</span>
                        </div>
                        <p className="text-sm text-white/65 leading-relaxed max-w-xs">
                            Your centralized platform for discovering all programs, workshops, seminars, and events happening at university.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-4">Navigation</h4>
                        <ul className="space-y-2.5">
                            {[
                                { href: '/', label: 'Home' },
                                { href: '/events', label: 'Events' },
                                { href: '/events?status=upcoming', label: 'Upcoming' },
                                { href: '/events?status=completed', label: 'Past Events' },
                                { href: '/calendar', label: 'Calendar' },
                            ].map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white text-sm mb-4">Departments</h4>
                        <ul className="space-y-2.5">
                            {['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Cultural Clubs'].map((d) => (
                                <li key={d}>
                                    <Link
                                        href={`/events?department=${encodeURIComponent(d)}`}
                                        className="text-sm text-white/60 hover:text-white transition-colors"
                                    >
                                        {d}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/40">
                        &copy; {new Date().getFullYear()} UniEvents. All rights reserved.
                    </p>
                    <p className="text-xs text-white/40">Built with ❤️ for university students</p>
                </div>
            </div>
        </footer>
    );
}
