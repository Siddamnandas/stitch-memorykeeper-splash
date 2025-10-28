
import { useState, useEffect } from 'react';
import { useError } from './ErrorContext';
import { 
  getMemories, 
  addMemory, 
  updateMemory, 
  deleteMemory,
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  getMemoryStrength,
  updateMemoryStrength
} from './dataService';
import { Memory, UserProfile } from './dataService';

export const useMemories = (userId: string | null) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleSupabaseError } = useError();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMemories = async () => {
      try {
        setLoading(true);
        const { data, error } = await getMemories(userId);
        
        if (error) {
          handleSupabaseError(error);
          setMemories([]);
        } else {
          setMemories(data || []);
        }
      } catch (error) {
        handleSupabaseError(error);
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [userId, handleSupabaseError]);

  const addNewMemory = async (memory: Omit<Memory, 'id' | 'created_at' | 'user_id'>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await addMemory(memory, userId);
      
      if (error) {
        handleSupabaseError(error);
        return null;
      }
      
      if (data) {
        setMemories(prev => [data, ...prev]);
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  };

  const updateExistingMemory = async (id: string, updates: Partial<Memory>) => {
    try {
      const { data, error } = await updateMemory(id, updates);
      
      if (error) {
        handleSupabaseError(error);
        return null;
      }
      
      if (data) {
        setMemories(prev => 
          prev.map(memory => memory.id === id ? data : memory)
        );
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  };

  const deleteExistingMemory = async (id: string) => {
    try {
      const { data, error } = await deleteMemory(id);
      
      if (error) {
        handleSupabaseError(error);
        return null;
      }
      
      setMemories(prev => prev.filter(memory => memory.id !== id));
      
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  };

  return {
    memories,
    loading,
    addMemory: addNewMemory,
    updateMemory: updateExistingMemory,
    deleteMemory: deleteExistingMemory
  };
};

export const useUserProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleSupabaseError } = useError();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await getUserProfile(userId);
        
        if (error) {
          handleSupabaseError(error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        handleSupabaseError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, handleSupabaseError]);

  const updateExistingProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await updateUserProfile(userId, updates);
      
      if (error) {
        handleSupabaseError(error);
        return null;
      }
      
      if (data) {
        setProfile(data);
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  };

  const createNewProfile = async (profileData: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await createUserProfile(userId, profileData);
      
      if (error) {
        handleSupabaseError(error);
        return null;
      }
      
      if (data) {
        setProfile(data);
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  };

  return {
    profile,
    loading,
    updateProfile: updateExistingProfile,
    createProfile: createNewProfile
  };
};

export const useMemoryStrength = (userId: string | null) => {
  const [strength, setStrength] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { handleSupabaseError } = useError();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMemoryStrength = async () => {
      try {
        setLoading(true);
        const { data, error } = await getMemoryStrength(userId);
        
        if (error) {
          handleSupabaseError(error);
        } else {
          setStrength(data || 0);
        }
      } catch (error) {
        handleSupabaseError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemoryStrength();
  }, [userId, handleSupabaseError]);

  const updateStrength = async (newStrength: number) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await updateMemoryStrength(userId, newStrength);
      
      if (error) {
        handleSupabaseError(error);
        return null;
      }
      
      if (data) {
        setStrength(newStrength);
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  };

  return {
    strength,
    loading,
    updateStrength
  };
};