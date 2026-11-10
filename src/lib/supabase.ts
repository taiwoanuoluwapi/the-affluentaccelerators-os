import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, UserRole } from '../types';

// Storage keys for dynamic in-app configuration
export const SUPABASE_URL_KEY = 'affluent_supabase_url';
export const SUPABASE_KEY_STORAGE = 'affluent_supabase_anon_key';

// Default project configuration (verified live Supabase project)
export const DEFAULT_SUPABASE_URL = 'https://pactzmpimnaeieijpvdw.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_pA9shxrcAhu7lKZnvf16iw_D7oJuwna';

export const getSupabaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(SUPABASE_URL_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
};

export const getSupabaseKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(SUPABASE_KEY_STORAGE);
    if (saved && saved.trim()) return saved.trim();
  }
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_KEY
  );
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(
    url &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    key &&
    key.length > 20
  );
};

// Singleton Supabase Client
let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!clientInstance) {
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'affluent_os_auth_token'
      }
    });
  }
  return clientInstance;
};

export const resetSupabaseClient = (newUrl?: string, newKey?: string): SupabaseClient => {
  if (typeof window !== 'undefined') {
    if (newUrl) localStorage.setItem(SUPABASE_URL_KEY, newUrl.trim());
    if (newKey) localStorage.setItem(SUPABASE_KEY_STORAGE, newKey.trim());
  }
  const url = newUrl?.trim() || getSupabaseUrl();
  const key = newKey?.trim() || getSupabaseKey();

  clientInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'affluent_os_auth_token'
    }
  });

  return clientInstance;
};

// Connectivity & Latency Ping
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  projectRef?: string;
}> => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  const startTime = Date.now();

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });
    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const projectRef = url.replace('https://', '').split('.')[0];
      return {
        success: true,
        latencyMs,
        message: `Connected successfully to Supabase (${projectRef}) in ${latencyMs}ms`,
        projectRef
      };
    } else {
      return {
        success: false,
        latencyMs,
        message: `Supabase returned HTTP status ${res.status}: ${res.statusText}`
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: err?.message || 'Failed to connect to Supabase'
    };
  }
};

// Fetch user profile from public.profiles table
export const fetchSupabaseProfile = async (
  userId: string
): Promise<Partial<User> | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('Could not fetch Supabase profile:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name || 'Staff Member',
      email: data.email,
      role: (data.role as UserRole) || 'sales_rep',
      title: data.title || 'Specialist',
      department: data.department || 'Operations',
      phone: data.phone || '',
      avatar: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      active: data.active ?? true,
      createdAt: data.created_at || new Date().toISOString()
    };
  } catch (e) {
    console.error('Error fetching Supabase profile:', e);
    return null;
  }
};
