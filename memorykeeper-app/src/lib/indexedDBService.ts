import { openDB as openIDB, IDBPDatabase } from 'idb';

// Define the structure of our data
export interface OfflineMemory {
  id: string;
  userId?: string;
  prompt: string;
  response: string;
  date: string;
  type: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  synced: boolean; // Whether this item has been synced with the server
}

export interface OfflineProfile {
  id: string;
  userId?: string;
  fullName?: string;
  avatarUrl?: string;
  memoryStrength: number;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

// Database configuration
const DB_NAME = 'MemoryKeeperDB';
const DB_VERSION = 2;
const MEMORIES_STORE = 'memories';
const PROFILES_STORE = 'profiles';

// Open database connection
export const openDB = async (): Promise<IDBPDatabase | null> => {
  try {
    return await openIDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create memories store (no change)
        if (!db.objectStoreNames.contains(MEMORIES_STORE)) {
          const memoriesStore = db.createObjectStore(MEMORIES_STORE, { keyPath: 'id' });
          memoriesStore.createIndex('by-userId', 'userId', { unique: false });
          memoriesStore.createIndex('by-createdAt', 'createdAt', { unique: false });
          memoriesStore.createIndex('by-synced', 'synced', { unique: false });
        }

        // Create or upgrade profiles store
        if (!db.objectStoreNames.contains(PROFILES_STORE)) {
          const profilesStore = db.createObjectStore(PROFILES_STORE, { keyPath: 'userId' });
          profilesStore.createIndex('by-synced', 'synced', { unique: false });
        } else if (oldVersion < 2) {
          // Migration: drop old store and recreate with new keyPath
          db.deleteObjectStore(PROFILES_STORE);
          const profilesStore = db.createObjectStore(PROFILES_STORE, { keyPath: 'userId' });
          profilesStore.createIndex('by-synced', 'synced', { unique: false });
        }
      },
    });
  } catch (error) {
    console.error('Error opening IndexedDB:', error);
    return null;
  }
};

// Add a memory to IndexedDB
export const addMemory = async (memory: Omit<OfflineMemory, 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;
    
    const memoryWithTimestamps: OfflineMemory = {
      ...memory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.put(MEMORIES_STORE, memoryWithTimestamps);
    return true;
  } catch (error) {
    console.error('Error adding memory to IndexedDB:', error);
    return false;
  }
};

// Get all memories from IndexedDB
export const getAllMemories = async (): Promise<OfflineMemory[]> => {
  try {
    const db = await openDB();
    if (!db) return [];
    
    return await db.getAll(MEMORIES_STORE);
  } catch (error) {
    console.error('Error getting memories from IndexedDB:', error);
    return [];
  }
};

// Get unsynced memories from IndexedDB
export const getUnsyncedMemories = async (): Promise<OfflineMemory[]> => {
  try {
    const db = await openDB();
    if (!db) return [];
    
    const allMemories = await db.getAll(MEMORIES_STORE);
    return allMemories.filter(memory => !memory.synced);
  } catch (error) {
    console.error('Error getting unsynced memories from IndexedDB:', error);
    return [];
  }
};

// Update a memory in IndexedDB
export const updateMemory = async (memory: Partial<OfflineMemory> & { id: string }): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;
    
    const existing = await db.get(MEMORIES_STORE, memory.id);
    if (existing) {
      const updatedMemory = {
        ...existing,
        ...memory,
        updatedAt: new Date().toISOString()
      };
      await db.put(MEMORIES_STORE, updatedMemory);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating memory in IndexedDB:', error);
    return false;
  }
};

// Delete a memory from IndexedDB
export const deleteMemory = async (id: string): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;
    
    await db.delete(MEMORIES_STORE, id);
    return true;
  } catch (error) {
    console.error('Error deleting memory from IndexedDB:', error);
    return false;
  }
};

// Add or update user profile in IndexedDB
export const saveProfile = async (profile: Omit<OfflineProfile, 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;
    
    const profileWithTimestamps: OfflineProfile = {
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.put(PROFILES_STORE, profileWithTimestamps);
    return true;
  } catch (error) {
    console.error('Error saving profile to IndexedDB:', error);
    return false;
  }
};

// Get user profile from IndexedDB
export const getProfile = async (userId: string): Promise<OfflineProfile | undefined> => {
  try {
    const db = await openDB();
    if (!db) return undefined;

    return await db.get(PROFILES_STORE, userId);
  } catch (error) {
    console.error('Error getting profile from IndexedDB:', error);
    return undefined;
  }
};

// Mark memories as synced
export const markMemoriesAsSynced = async (memoryIds: string[]): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;
    
    for (const id of memoryIds) {
      const memory = await db.get(MEMORIES_STORE, id);
      if (memory) {
        memory.synced = true;
        memory.updatedAt = new Date().toISOString();
        await db.put(MEMORIES_STORE, memory);
      }
    }
    return true;
  } catch (error) {
    console.error('Error marking memories as synced in IndexedDB:', error);
    return false;
  }
};

// Mark profile as synced
export const markProfileAsSynced = async (userId: string): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;

    const profile = await db.get(PROFILES_STORE, userId);
    if (profile) {
      profile.synced = true;
      profile.updatedAt = new Date().toISOString();
      await db.put(PROFILES_STORE, profile);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error marking profile as synced in IndexedDB:', error);
    return false;
  }
};

// Add a single memory to IndexedDB (for sync downloads)
export const addSingleMemory = async (memory: Omit<OfflineMemory, 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;

    const memoryWithTimestamps: OfflineMemory = {
      ...memory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.put(MEMORIES_STORE, memoryWithTimestamps);
    return true;
  } catch (error) {
    console.error('Error adding single memory to IndexedDB:', error);
    return false;
  }
};

// Get memories by user ID
export const getMemoriesByUserId = async (userId: string): Promise<OfflineMemory[]> => {
  try {
    const db = await openDB();
    if (!db) return [];

    const index = db.transaction(MEMORIES_STORE).store.index('by-userId');
    return await index.getAll(userId);
  } catch (error) {
    console.error('Error getting memories by user ID:', error);
    return [];
  }
};

// Update memory sync status by user ID
export const markUserMemoriesAsSynced = async (userId: string): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;

    const memories = await getMemoriesByUserId(userId);
    const unsyncedMemories = memories.filter(m => !m.synced);

    for (const memory of unsyncedMemories) {
      memory.synced = true;
      memory.updatedAt = new Date().toISOString();
      await db.put(MEMORIES_STORE, memory);
    }

    return true;
  } catch (error) {
    console.error('Error marking user memories as synced:', error);
    return false;
  }
};

// Clear all data from IndexedDB (for testing purposes)
export const clearAllData = async (): Promise<boolean> => {
  try {
    const db = await openDB();
    if (!db) return false;

    await db.clear(MEMORIES_STORE);
    await db.clear(PROFILES_STORE);
    return true;
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    return false;
  }
};
