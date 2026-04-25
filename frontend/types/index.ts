export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'secondary_admin' | 'superior_admin';
    department?: string;
    token?: string;
}

export interface Event {
    _id: string;
    title: string;
    description: string;
    department: string;
    eventType: string;
    date: string;
    endDate?: string;
    venue: string;
    poster: string;
    registrationLink?: string;
    status: 'upcoming' | 'completed';
    featured: boolean;
    tags: string[];
    createdBy: { _id: string; name: string; email?: string };
    createdAt: string;
}

export interface Notification {
    _id: string;
    userId: string;
    eventId?: Event;
    message: string;
    type: 'new_event' | 'event_update' | 'system';
    read: boolean;
    createdAt: string;
}

export interface EventsResponse {
    events: Event[];
    total: number;
    page: number;
    pages: number;
}

export interface NotificationsResponse {
    notifications: Notification[];
    unreadCount: number;
}

export type Department =
    | 'Computer Science'
    | 'Electronics'
    | 'Mechanical'
    | 'Civil'
    | 'Cultural Clubs'
    | 'Management'
    | 'Science'
    | 'Other';

export type EventType =
    | 'Workshop'
    | 'Seminar'
    | 'Hackathon'
    | 'Fest'
    | 'Sports'
    | 'Academic'
    | 'Cultural'
    | 'Other';
