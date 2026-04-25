'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string, department?: string) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
    isSuperiorAdmin: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const revalidate = async () => {
            try {
                const savedUser = localStorage.getItem('uni_user');
                const token = localStorage.getItem('uni_token');
                if (savedUser && token) {
                    // Restore from cache immediately for fast UI
                    setUser(JSON.parse(savedUser));
                    // Re-validate token against server
                    try {
                        const { data } = await api.get('/auth/me');
                        // Update with fresh server data (role, name, etc.)
                        localStorage.setItem('uni_user', JSON.stringify(data));
                        setUser(data);
                    } catch {
                        // Token invalid or expired – force logout
                        localStorage.removeItem('uni_token');
                        localStorage.removeItem('uni_user');
                        setUser(null);
                    }
                }
            } catch (e) { }
            setLoading(false);
        };
        revalidate();
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const { data } = await api.post('/auth/login', { email, password });
        const { token, ...userData } = data;
        localStorage.setItem('uni_token', token);
        localStorage.setItem('uni_user', JSON.stringify(userData));
        setUser(userData);
        return userData as User;
    };

    const register = async (name: string, email: string, password: string, department?: string) => {
        const { data } = await api.post('/auth/register', { name, email, password, department });
        const { token, ...userData } = data;
        localStorage.setItem('uni_token', token);
        localStorage.setItem('uni_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('uni_token');
        localStorage.removeItem('uni_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAdmin: user?.role === 'secondary_admin' || user?.role === 'superior_admin',
                isSuperiorAdmin: user?.email === 'premvellogi@gmail.com',
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
