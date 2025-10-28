import { supabase } from './supabaseClient';

// Type for safe Supabase client
type SafeSupabaseClient = NonNullable<typeof supabase>;
import { getMemories, Memory } from './dataService';
import { addActivityAndRecalculate } from './memoryStrengthService';
import { sanitizeTextInput } from './inputSanitizer';

export interface SharedMemory {
  id: string;
  original_memory_id: string;
  owner_id: string;
  shared_with_user_id: string;
  permission_level: 'view' | 'edit' | 'admin';
  shared_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface MemoryShare {
  id: string;
  memory_id: string;
  shared_by_user_id: string;
  shared_with_user_ids: string[];
  permission_level: 'view' | 'edit';
  message?: string;
  expires_at?: string;
  created_at: string;
}

export interface CollaborativeMemory {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  collaborators: string[];
  permissions: Record<string, 'view' | 'edit' | 'admin'>;
  shared_memories: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollaborationInvite {
  id: string;
  collection_id: string;
  invited_by_user_id: string;
  invited_user_email: string;
  invited_user_id?: string;
  permission_level: 'view' | 'edit';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  expires_at: string;
  created_at: string;
}

/**
 * Share a memory with another user
 */
export const shareMemoryWithUser = async (
  memoryId: string,
  sharedWithUserId: string,
  permissionLevel: 'view' | 'edit' = 'view',
  message?: string,
  expiresAt?: Date
): Promise<{ success: boolean; shareId?: string; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data: user } = await (supabase as SafeSupabaseClient).auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if memory exists and user owns it
    const { data: memories } = await getMemories(user.user.id);
    const memory = memories?.find(m => m.id === memoryId);
    if (!memory) throw new Error('Memory not found or access denied');

    // Create share record
    const shareData = {
      memory_id: memoryId,
      shared_by_user_id: user.user.id,
      shared_with_user_ids: [sharedWithUserId],
      permission_level: permissionLevel,
      message: message ? sanitizeTextInput(message) : undefined,
      expires_at: expiresAt?.toISOString(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('memory_shares')
      .insert([shareData])
      .select()
      .single();

    if (error) throw error;

    // Update memory strength for sharing activity
    await addActivityAndRecalculate(user.user.id, {
      type: 'memory_shared',
      timestamp: new Date(),
      value: 8,
      metadata: { memoryId }
    });

    return { success: true, shareId: data.id };
  } catch (error: any) {
    console.error('Error sharing memory:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get memories shared with the current user
 */
export const getSharedMemoriesWithMe = async (
  userId: string
): Promise<{ data: any[] | null; error: any }> => {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('memory_shares')
      .select(`
        id,
        memory_id,
        shared_by_user_id,
        permission_level,
        message,
        created_at,
        expires_at,
        memories (
          id,
          prompt,
          response,
          date,
          type,
          tags,
          user_id
        ),
        profiles!memory_shares_shared_by_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('shared_with_user_ids', userId)
      .eq('is_active', true)
      .is('expires_at', null)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    return { data, error };
  } catch (error) {
    console.error('Error fetching shared memories:', error);
    return { data: null, error };
  }
};

/**
 * Get memories shared by the current user
 */
export const getMemoriesSharedByMe = async (
  userId: string
): Promise<{ data: any[] | null; error: any }> => {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('memory_shares')
      .select(`
        id,
        memory_id,
        shared_with_user_ids,
        permission_level,
        message,
        created_at,
        expires_at,
        memories (
          id,
          prompt,
          response,
          date,
          type,
          tags
        )
      `)
      .eq('shared_by_user_id', userId)
      .eq('is_active', true);

    return { data, error };
  } catch (error) {
    console.error('Error fetching shared memories:', error);
    return { data: null, error };
  }
};

/**
 * Retrieve specific memories by their IDs
 */
export const getMemoriesByIds = async (
  memoryIds: string[]
): Promise<{ data: Memory[]; error: any }> => {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  if (memoryIds.length === 0) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('memories')
      .select('*')
      .in('id', memoryIds);

    return { data: data ?? [], error };
  } catch (error) {
    console.error('Error fetching memories by IDs:', error);
    return { data: [], error };
  }
};

/**
 * Create a collaborative memory collection
 */
export const createCollaborativeCollection = async (
  title: string,
  description?: string,
  isPublic: boolean = false
): Promise<{ success: boolean; collectionId?: string; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data: user } = await (supabase as SafeSupabaseClient).auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const collectionData = {
      title: sanitizeTextInput(title),
      description: description ? sanitizeTextInput(description) : undefined,
      owner_id: user.user.id,
      collaborators: [user.user.id],
      permissions: { [user.user.id]: 'admin' },
      shared_memories: [],
      is_public: isPublic,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('collaborative_collections')
      .insert([collectionData])
      .select()
      .single();

    if (error) throw error;

    return { success: true, collectionId: data.id };
  } catch (error: any) {
    console.error('Error creating collaborative collection:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Invite user to collaborative collection
 */
export const inviteUserToCollection = async (
  collectionId: string,
  email: string,
  permissionLevel: 'view' | 'edit' = 'view',
  message?: string
): Promise<{ success: boolean; inviteId?: string; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data: user } = await (supabase as SafeSupabaseClient).auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if user has admin permission for this collection
    const { data: collection } = await (supabase as SafeSupabaseClient)
      .from('collaborative_collections')
      .select('permissions')
      .eq('id', collectionId)
      .eq('owner_id', user.user.id)
      .single();

    if (!collection || collection.permissions[user.user.id] !== 'admin') {
      throw new Error('Insufficient permissions to invite users');
    }

    // Find user by email
    const { data: invitedUser } = await (supabase as SafeSupabaseClient)
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    const inviteData = {
      collection_id: collectionId,
      invited_by_user_id: user.user.id,
      invited_user_email: email.toLowerCase(),
      invited_user_id: invitedUser?.id,
      permission_level: permissionLevel,
      status: 'pending',
      message: message ? sanitizeTextInput(message) : undefined,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('collaboration_invites')
      .insert([inviteData])
      .select()
      .single();

    if (error) throw error;

    return { success: true, inviteId: data.id };
  } catch (error: any) {
    console.error('Error inviting user to collection:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Accept collaboration invite
 */
export const acceptCollaborationInvite = async (
  inviteId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data: user } = await (supabase as SafeSupabaseClient).auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get invite details
    const { data: invite } = await (supabase as SafeSupabaseClient)
      .from('collaboration_invites')
      .select('collection_id, permission_level, invited_user_id')
      .eq('id', inviteId)
      .eq('invited_user_id', user.user.id)
      .eq('status', 'pending')
      .single();

    if (!invite) throw new Error('Invite not found or already processed');

    // Update invite status
    await (supabase as SafeSupabaseClient)
      .from('collaboration_invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId);

    // Add user to collection collaborators
    const { data: collection } = await (supabase as SafeSupabaseClient)
      .from('collaborative_collections')
      .select('collaborators, permissions')
      .eq('id', invite.collection_id)
      .single();

    if (collection) {
      const updatedCollaborators = [...collection.collaborators, user.user.id];
      const updatedPermissions = {
        ...collection.permissions,
        [user.user.id]: invite.permission_level
      };

      await (supabase as SafeSupabaseClient)
        .from('collaborative_collections')
        .update({
          collaborators: updatedCollaborators,
          permissions: updatedPermissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', invite.collection_id);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error accepting collaboration invite:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch invites created by the current user
 */
export const getInvitesSentByUser = async (
  userId: string
): Promise<{ data: CollaborationInvite[] | null; error: any }> => {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('collaboration_invites')
      .select(`
        id,
        collection_id,
        invited_by_user_id,
        invited_user_email,
        invited_user_id,
        permission_level,
        status,
        message,
        expires_at,
        created_at,
        collaborative_collections (
          title
        ),
        inviter:profiles!collaboration_invites_invited_by_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('invited_by_user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching invites sent by user:', error);
    return { data: null, error };
  }
};

/**
 * Fetch invites where the user (or their email) is the recipient
 */
export const getInvitesForUser = async (
  userId: string,
  email: string
): Promise<{ data: CollaborationInvite[] | null; error: any }> => {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const lowerEmail = email?.toLowerCase?.() ?? '';
    const now = new Date().toISOString();

    const filters: string[] = [];
    if (userId) filters.push(`invited_user_id.eq.${userId}`);
    if (lowerEmail) filters.push(`invited_user_email.eq.${lowerEmail}`);

    if (filters.length === 0) {
      return { data: [], error: null };
    }

    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('collaboration_invites')
      .select(`
        id,
        collection_id,
        invited_by_user_id,
        invited_user_email,
        invited_user_id,
        permission_level,
        status,
        message,
        expires_at,
        created_at,
        collaborative_collections (
          title
        ),
        inviter:profiles!collaboration_invites_invited_by_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .or(filters.join(','))
      .eq('status', 'pending')
      .gte('expires_at', now)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching invites for user:', error);
    return { data: null, error };
  }
};

/**
 * Decline collaboration invite
 */
export const declineCollaborationInvite = async (
  inviteId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await (supabase as SafeSupabaseClient)
      .from('collaboration_invites')
      .update({ status: 'declined' })
      .eq('id', inviteId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error declining collaboration invite:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's collaborative collections
 */
export const getUserCollaborativeCollections = async (
  userId: string
): Promise<{ data: any[] | null; error: any }> => {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('collaborative_collections')
      .select(`
        id,
        title,
        description,
        owner_id,
        collaborators,
        permissions,
        shared_memories,
        is_public,
        created_at,
        updated_at,
        profiles!collaborative_collections_owner_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .contains('collaborators', [userId])
      .order('updated_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching collaborative collections:', error);
    return { data: null, error };
  }
};

/**
 * Add memory to collaborative collection
 */
export const addMemoryToCollection = async (
  collectionId: string,
  memoryId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data: user } = await (supabase as SafeSupabaseClient).auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check permissions
    const { data: collection } = await (supabase as SafeSupabaseClient)
      .from('collaborative_collections')
      .select('permissions, shared_memories')
      .eq('id', collectionId)
      .single();

    const userPermission = collection?.permissions[user.user.id];
    if (!userPermission || userPermission === 'view') {
      throw new Error('Insufficient permissions to add memories');
    }

    // Add memory to collection
    const updatedMemories = [...(collection?.shared_memories || []), memoryId];

    const { error } = await (supabase as SafeSupabaseClient)
      .from('collaborative_collections')
      .update({
        shared_memories: updatedMemories,
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error adding memory to collection:', error);
    return { success: false, error: error.message };
  }
};

// Export service object
export const collaborativeMemoryService = {
  shareMemoryWithUser,
  getSharedMemoriesWithMe,
  getMemoriesSharedByMe,
  createCollaborativeCollection,
  inviteUserToCollection,
  acceptCollaborationInvite,
  declineCollaborationInvite,
  getUserCollaborativeCollections,
  addMemoryToCollection,
  getMemoriesByIds,
  getInvitesSentByUser,
  getInvitesForUser
};
