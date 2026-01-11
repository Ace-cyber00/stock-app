'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function getWatchlistByEmail(email: string): Promise<StockWithData[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }).lean();
    return items.map((item) => ({
      userId: String(item.userId),
      symbol: String(item.symbol),
      company: String(item.company),
      addedAt: item.addedAt instanceof Date ? item.addedAt : new Date(item.addedAt),
    }));
  } catch (err) {
    console.error('getWatchlistByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(symbol: string, company: string): Promise<{ success: boolean; error?: string }> {
  if (!symbol || !company) {
    return { success: false, error: 'Symbol and company are required' };
  }

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Import auth dynamically to avoid circular dependencies
    const { auth } = await import('@/lib/betterAuth/auth');
    const { headers } = await import('next/headers');

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return { success: false, error: 'User not authenticated' };
    }

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email: session.user.email });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) {
      return { success: false, error: 'User ID not found' };
    }

    // Check if already in watchlist
    const existing = await Watchlist.findOne({ userId, symbol: symbol.toUpperCase() });
    if (existing) {
      return { success: true }; // Already exists, consider it a success
    }

    await Watchlist.create({
      userId,
      symbol: symbol.toUpperCase(),
      company,
      addedAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    console.error('addToWatchlist error:', err);
    return { success: false, error: 'Failed to add to watchlist' };
  }
}

export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean; error?: string }> {
  if (!symbol) {
    return { success: false, error: 'Symbol is required' };
  }

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const { auth } = await import('@/lib/betterAuth/auth');
    const { headers } = await import('next/headers');

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return { success: false, error: 'User not authenticated' };
    }

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email: session.user.email });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) {
      return { success: false, error: 'User ID not found' };
    }

    await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });

    return { success: true };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    return { success: false, error: 'Failed to remove from watchlist' };
  }
}
