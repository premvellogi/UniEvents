'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, Calendar, Zap, X, Megaphone, Filter } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import EventCard from '@/components/EventCard';
import { Event } from '@/types';
import api from '@/lib/api';

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

const DEPARTMENTS = [
  { name: 'All', icon: '🎓' },
  { name: 'Computer Science', icon: '💻' },
  { name: 'Electronics', icon: '⚡' },
  { name: 'Mechanical', icon: '⚙️' },
  { name: 'Civil', icon: '🏗️' },
  { name: 'Cultural Clubs', icon: '🎭' },
  { name: 'Management', icon: '📊' },
  { name: 'Science', icon: '🔬' },
];

const EVENT_TYPE_COLORS: Record<string, string> = {
  Hackathon: 'bg-purple-50 text-purple-700 border-purple-100',
  Workshop: 'bg-blue-50 text-blue-700 border-blue-100',
  Seminar: 'bg-teal-50 text-teal-700 border-teal-100',
  Fest: 'bg-pink-50 text-pink-700 border-pink-100',
  Sports: 'bg-orange-50 text-orange-700 border-orange-100',
  Academic: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Cultural: 'bg-rose-50 text-rose-700 border-rose-100',
  Other: 'bg-gray-50 text-gray-600 border-gray-100',
};

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ upcoming: 0, departments: 0, students: 0 });
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [eventTypeCounts, setEventTypeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, upcomingRes] = await Promise.all([
          api.get('/events?featured=true&status=upcoming&limit=3'),
          api.get('/events?status=upcoming&limit=50'),
        ]);
        setFeaturedEvents(featRes.data.events);
        const all: Event[] = upcomingRes.data.events;
        setUpcomingEvents(all);
        setFilteredEvents(all.slice(0, 6));
        setStats({
          upcoming: upcomingRes.data.total,
          departments: 8,
          students: 0,
        });

        // Count event types
        const counts: Record<string, number> = {};
        all.forEach((e) => {
          counts[e.eventType] = (counts[e.eventType] || 0) + 1;
        });
        setEventTypeCounts(counts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // Load latest broadcast announcement
    const loadAnnouncement = async () => {
      try {
        const { data } = await api.get('/notifications/latest-broadcast');
        if (data?.message) setAnnouncement(data.message);
      } catch {
        // No announcement or endpoint not available – silently skip
      }
    };

    load();
    loadAnnouncement();
  }, []);

  // Filter upcoming events by department
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredEvents(upcomingEvents.slice(0, 6));
    } else {
      setFilteredEvents(upcomingEvents.filter((e) => e.department === activeFilter).slice(0, 6));
    }
  }, [activeFilter, upcomingEvents]);

  const statItems = [
    { icon: Calendar, label: 'Upcoming Events', value: stats.upcoming, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: TrendingUp, label: 'Departments', value: 8, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Zap, label: 'Event Types', value: 8, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div>
      {/* Announcement Banner */}
      <AnimatePresence>
        {announcement && !announcementDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.35 }}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Megaphone size={16} className="flex-shrink-0 opacity-80" />
                <p className="text-sm font-medium truncate">{announcement}</p>
              </div>
              <button
                onClick={() => setAnnouncementDismissed(true)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Dismiss announcement"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <HeroSection />

      {/* Stats Bar */}
      <section className="backdrop-blur-sm border-y border-white/20" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 divide-x divide-white/30">
            {statItems.map((item) => (
              <div key={item.label} className="flex flex-col sm:flex-row items-center justify-center gap-3 px-6 py-2">
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon size={18} className={item.color} />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: '#0c2d48' }}>{loading ? '–' : item.value}+</p>
                  <p className="text-xs" style={{ color: '#1a4a6b' }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Type Pills */}
      {!loading && Object.keys(eventTypeCounts).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-orange-500" />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#1a4a6b' }}>Event Types</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(eventTypeCounts).map(([type, count]) => (
              <Link
                key={type}
                href={`/events?eventType=${encodeURIComponent(type)}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all hover:shadow-sm ${EVENT_TYPE_COLORS[type] || 'bg-gray-50 text-gray-600 border-gray-100'}`}
              >
                {type}
                <span className="font-bold opacity-70">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#f59e0b' }}>⭐ Featured</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: '#0c2d48' }}>Spotlight Events</h2>
          </div>
          <Link href="/events?featured=true" className="hidden sm:flex items-center gap-2 text-sm font-medium transition-colors group" style={{ color: '#1a4a6b' }}>
            View all <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featuredEvents.length > 0
              ? featuredEvents.map((e) => <EventCard key={e._id} event={e} variant="featured" />)
              : (
                <div className="col-span-3 text-center py-16" style={{ color: '#0c2d48' }}>
                  <Calendar size={40} className="mx-auto mb-3" style={{ color: '#0c2d48' }} />
                  <p className="font-medium">No featured events right now. Check back soon!</p>
                </div>
              )
          }
        </div>
      </section>

      {/* Department Highlights */}
      <section className="backdrop-blur-sm border-y border-white/15 py-16" style={{ background: 'rgba(255, 255, 255, 0.10)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: '#0c2d48' }}>Browse by Department</h2>
            <p style={{ color: '#1a4a6b' }}>Find events relevant to your area of study</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: 'Computer Science', icon: '💻', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100' },
              { name: 'Electronics', icon: '⚡', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100' },
              { name: 'Mechanical', icon: '⚙️', color: 'bg-orange-50 hover:bg-orange-100 border-orange-100' },
              { name: 'Civil', icon: '🏗️', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100' },
              { name: 'Cultural Clubs', icon: '🎭', color: 'bg-pink-50 hover:bg-pink-100 border-pink-100' },
            ].map((dept) => (
              <Link
                key={dept.name}
                href={`/events?department=${encodeURIComponent(dept.name)}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/30 transition-all duration-200 text-center group backdrop-blur-sm bg-white/20 hover:bg-white/35`}
              >
                <span className="text-3xl">{dept.icon}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 leading-snug">{dept.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events with Department Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#eab308' }}>📅 What's Coming</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: '#0c2d48' }}>Upcoming Events</h2>
          </div>
          <Link href="/events?status=upcoming" className="hidden sm:flex items-center gap-2 text-sm font-medium group" style={{ color: '#1a4a6b' }}>
            See all <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Department Filter Chips */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.name}
              onClick={() => setActiveFilter(dept.name)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                activeFilter === dept.name
                  ? 'bg-sky-700/90 text-white border-sky-700'
                  : 'bg-white/65 backdrop-blur-sm text-gray-700 border-white/50 hover:border-sky-300 hover:bg-white/80'
              }`}
            >
              <span>{dept.icon}</span>
              {dept.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : filteredEvents.length > 0
              ? filteredEvents.map((e, i) => (
                <motion.div
                  key={e._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <EventCard event={e} />
                </motion.div>
              ))
              : (
                <div className="col-span-3 text-center py-16" style={{ color: '#0c2d48' }}>
                  <Calendar size={40} className="mx-auto mb-3" style={{ color: '#0c2d48' }} />
                  <p className="font-medium">No upcoming events in this department yet.</p>
                </div>
              )
          }
        </div>

        <div className="text-center mt-10">
          <Link
            href={activeFilter === 'All' ? '/events' : `/events?department=${encodeURIComponent(activeFilter)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-all shadow-sm"
          >
            View All Events <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
