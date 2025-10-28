import { supabase } from './supabaseClient';
import { Memory } from './dataService';

// Add memory to user data
export const addMemoryToUserData = async (userId: string, memory: Memory): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('memories')
    .insert({
      user_id: userId,
      prompt: memory.prompt,
      response: memory.response,
      date: memory.date,
      type: memory.type,
      tags: memory.tags
    });

  if (error) throw error;
};