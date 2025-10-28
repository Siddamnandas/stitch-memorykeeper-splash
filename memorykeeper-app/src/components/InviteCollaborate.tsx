import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, Plus, Mail, X, UserPlus, Loader2, AlertTriangle, Bell, CheckCircle, Image, Video, FileText } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';
import { Memory, addMemory } from '../lib/dataService';
import FileUpload, { ProcessedFileData } from './FileUpload';
import { sanitizeTextInput, sanitizeMemoryData } from '../lib/inputSanitizer';
import {
  collaborativeMemoryService,
  CollaborativeMemory,
  CollaborationInvite
} from '../lib/collaborativeMemoryService';
import { supabase } from '../lib/supabaseClient';

type CollectionWithDetails = CollaborativeMemory & {
  ownerProfileName?: string | null;
  ownerProfileAvatar?: string | null;
  memoryDetails: Memory[];
};

type InviteWithCollection = CollaborationInvite & {
  collaborative_collections?: {
    title?: string | null;
  };
  inviter?: {
    full_name?: string | null;
    avatar_url?: string | null;
  };
};

type SharedMemoryDetail = {
  id: string;
  permission_level: 'view' | 'edit' | 'admin';
  shared_at: string;
  memory: Memory;
  owner?: {
    full_name?: string | null;
    avatar_url?: string | null;
  };
};

type ParsedMemoryContent = {
  caption: string;
  mediaType: 'image' | 'video' | 'document' | 'text';
  preview?: string;
  fileName?: string;
};

const InviteCollaborate = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const { addToast } = useError();

  const userId = user?.id;
  const userEmail = user?.email || '';

  const [collections, setCollections] = useState<CollectionWithDetails[]>([]);
  const [sharedMemories, setSharedMemories] = useState<SharedMemoryDetail[]>([]);
  const [sentInvites, setSentInvites] = useState<CollaborationInvite[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<InviteWithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    permission: 'view' as 'view' | 'edit',
    message: ''
  });
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [respondingInviteId, setRespondingInviteId] = useState<string | null>(null);
  const [selectedUploadCollectionId, setSelectedUploadCollectionId] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState<ProcessedFileData | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploadingMemory, setIsUploadingMemory] = useState(false);

  const editableCollections = useMemo(() => {
    if (!userId) return [] as CollectionWithDetails[];
    return collections.filter((collection) => {
      const permission = collection.permissions?.[userId];
      return permission === 'admin' || permission === 'edit';
    });
  }, [collections, userId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId || !supabase) return;

    // Subscribe to collaborative collections changes
    const collectionsSubscription = supabase
      .channel('collaborative_collections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborative_collections'
        },
        async (payload) => {
          // Reload data when collections change
          await loadCollaborationData();
          
          // Show notification for new collections where user is a collaborator
          if (payload.eventType === 'INSERT') {
            const newCollection = payload.new as CollaborativeMemory;
            if (newCollection.collaborators.includes(userId)) {
              addToast({
                type: 'success',
                title: 'New Collection',
                message: `You've been added to a new collaborative collection: ${newCollection.title}`,
                duration: 5000
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to collaboration invites changes
    const invitesSubscription = supabase
      .channel('collaboration_invites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_invites'
        },
        async (payload) => {
          // Reload data when invites change
          await loadCollaborationData();
          
          // Show notification for new invites
          if (payload.eventType === 'INSERT') {
            const newInvite = payload.new as CollaborationInvite;
            if (newInvite.invited_user_email === userEmail || newInvite.invited_user_id === userId) {
              addToast({
                type: 'info',
                title: 'New Invitation',
                message: 'You have a new collaboration invitation!',
                duration: 5000
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to shared memories changes
    const sharedMemoriesSubscription = supabase
      .channel('shared_memories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memory_shares'
        },
        async (payload) => {
          // Reload data when shared memories change
          await loadCollaborationData();
          
          // Show notification for new shared memories
          if (payload.eventType === 'INSERT') {
            const newShare = payload.new;
            if (newShare.shared_with_user_ids?.includes(userId)) {
              addToast({
                type: 'success',
                title: 'New Shared Memory',
                message: 'A family member shared a new memory with you!',
                duration: 5000
              });
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      collectionsSubscription.unsubscribe();
      invitesSubscription.unsubscribe();
      sharedMemoriesSubscription.unsubscribe();
    };
  }, [userId, userEmail, addToast]);

  const loadCollaborationData = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);

    try {
      const [collectionsRes, sharedRes, sentRes, incomingRes] = await Promise.all([
        collaborativeMemoryService.getUserCollaborativeCollections(userId),
        collaborativeMemoryService.getSharedMemoriesWithMe(userId),
        collaborativeMemoryService.getInvitesSentByUser(userId),
        collaborativeMemoryService.getInvitesForUser(userId, userEmail)
      ]);

      const rawCollections = collectionsRes.data ?? [];
      const allMemoryIds = Array.from(
        new Set(
          rawCollections.flatMap((collection: CollaborativeMemory & { shared_memories?: string[] }) => collection.shared_memories ?? [])
        )
      ).filter(Boolean) as string[];

      let memoryMap = new Map<string, Memory>();
      if (allMemoryIds.length > 0) {
        const memoryRes = await collaborativeMemoryService.getMemoriesByIds(allMemoryIds);
        if (memoryRes.error) {
          console.error('Error loading memory details:', memoryRes.error);
          addToast({
            type: 'error',
            title: 'Load Failed',
            message: 'Unable to load shared memory details.',
            duration: 5000
          });
        } else {
          memoryMap = new Map(
            (memoryRes.data ?? [])
              .filter((memory) => memory.id)
              .map((memory) => [memory.id as string, memory])
          );
        }
      }

      const collectionsWithDetails: CollectionWithDetails[] = rawCollections.map((collection: any) => ({
        ...collection,
        ownerProfileName: collection.profiles?.full_name,
        ownerProfileAvatar: collection.profiles?.avatar_url,
        memoryDetails: (collection.shared_memories ?? [])
          .map((memoryId: string) => memoryMap.get(memoryId))
          .filter(Boolean) as Memory[]
      }));

      setCollections(collectionsWithDetails);
      setActiveCollectionId((prev) => prev ?? (collectionsWithDetails[0]?.id ?? null));

      const sharedDetails: SharedMemoryDetail[] = (sharedRes.data ?? [])
        .map((item: any) => {
          if (!item.memories) {
            return null;
          }
          return {
            id: item.id,
            permission_level: item.permission_level,
            shared_at: item.created_at ?? item.shared_at ?? new Date().toISOString(),
            memory: item.memories as Memory,
            owner: item.profiles
          };
        })
        .filter(Boolean) as SharedMemoryDetail[];

      setSharedMemories(sharedDetails);
      setSentInvites(sentRes.data ?? []);
      setIncomingInvites(incomingRes.data ?? []);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
      addToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Unable to load collaboration data. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, userEmail, userId]);

  useEffect(() => {
    if (userId) {
      loadCollaborationData();
    }
  }, [loadCollaborationData, userId]);

  useEffect(() => {
    if (editableCollections.length > 0) {
      setSelectedUploadCollectionId((prev) => prev ?? editableCollections[0].id);
    } else {
      setSelectedUploadCollectionId(null);
      setPendingUpload(null);
    }
  }, [editableCollections]);

  const handleOpenInvite = useCallback(() => {
    if (collections.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Collections',
        message: 'Create a collaborative collection before inviting others.',
        duration: 4000
      });
      return;
    }

    setActiveCollectionId((prev) => prev ?? collections[0].id);
    setInviteModalOpen(true);
  }, [addToast, collections]);

  const handleSendInvite = useCallback(async () => {
    const email = inviteData.email.trim().toLowerCase();

    if (!email) {
      addToast({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter an email address to send an invite.',
        duration: 4000
      });
      return;
    }

    if (!activeCollectionId) {
      addToast({
        type: 'error',
        title: 'No Collection Selected',
        message: 'Select a collection to share with your family.',
        duration: 4000
      });
      return;
    }

    if (email === userEmail) {
      addToast({
        type: 'warning',
        title: 'Cannot Invite Yourself',
        message: 'Please enter a different email address.',
        duration: 4000
      });
      return;
    }

    setIsSubmittingInvite(true);

    try {
      const result = await collaborativeMemoryService.inviteUserToCollection(
        activeCollectionId,
        email,
        inviteData.permission,
        inviteData.message.trim() || undefined
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      addToast({
        type: 'success',
        title: 'Invite Sent',
        message: `Invitation sent to ${email}.`,
        duration: 4000
      });

      setInviteData({ email: '', permission: 'view', message: '' });
      setInviteModalOpen(false);
      await loadCollaborationData();
    } catch (error: any) {
      console.error('Error sending invite:', error);
      addToast({
        type: 'error',
        title: 'Invite Failed',
        message: error?.message || 'Failed to send invitation.',
        duration: 5000
      });
    } finally {
      setIsSubmittingInvite(false);
    }
  }, [activeCollectionId, addToast, inviteData, loadCollaborationData, userEmail]);

  const handleRespondToInvite = useCallback(
    async (inviteId: string, action: 'accept' | 'decline') => {
      setRespondingInviteId(inviteId);

      try {
        if (action === 'accept') {
          const result = await collaborativeMemoryService.acceptCollaborationInvite(inviteId);
          if (!result.success) {
            throw new Error(result.error);
          }

          addToast({
            type: 'success',
            title: 'Invite Accepted',
            message: 'You have successfully joined the collaborative collection.',
            duration: 4000
          });
        } else {
          const result = await collaborativeMemoryService.declineCollaborationInvite(inviteId);
          if (!result.success) {
            throw new Error(result.error);
          }

          addToast({
            type: 'info',
            title: 'Invite Declined',
            message: 'You have declined the collaboration invitation.',
            duration: 4000
          });
        }

        await loadCollaborationData();
      } catch (error: any) {
        console.error(`Error ${action}ing invite:`, error);
        addToast({
          type: 'error',
          title: `${action === 'accept' ? 'Accept' : 'Decline'} Failed`,
          message: error?.message || `Failed to ${action} invitation.`,
          duration: 5000
        });
      } finally {
        setRespondingInviteId(null);
      }
    },
    [addToast, loadCollaborationData]
  );

  const parseMemoryContent = useCallback(
    (memory: Memory): ParsedMemoryContent => {
      try {
        const parsed = JSON.parse(memory.response);
        if (parsed && typeof parsed === 'object' && 'mediaType' in parsed) {
          const mediaType = ['image', 'video', 'document'].includes(parsed.mediaType)
            ? parsed.mediaType
            : 'document';

          return {
            caption: parsed.caption || memory.response,
            mediaType,
            preview: typeof parsed.preview === 'string' ? parsed.preview : undefined,
            fileName: typeof parsed.fileName === 'string' ? parsed.fileName : undefined
          };
        }
      } catch (error) {
        // fallback to plain response
      }

      return {
        caption: memory.response,
        mediaType: 'text'
      };
    },
    []
  );

  const handleFileProcessed = useCallback(
    (fileData: ProcessedFileData) => {
      setPendingUpload(fileData);
      setUploadCaption('');
    },
    []
  );

  const handleUploadMemory = useCallback(async () => {
    if (!userId) {
      addToast({
        type: 'error',
        title: 'Not Signed In',
        message: 'You must be signed in to upload memories.',
        duration: 4000
      });
      return;
    }

    if (!pendingUpload) {
      addToast({
        type: 'error',
        title: 'No File Selected',
        message: 'Please choose a photo or video to upload.',
        duration: 4000
      });
      return;
    }

    if (!selectedUploadCollectionId) {
      addToast({
        type: 'error',
        title: 'Select a Collection',
        message: 'Choose a collection to receive this memory.',
        duration: 4000
      });
      return;
    }

    const targetCollection = editableCollections.find((collection) => collection.id === selectedUploadCollectionId);
    if (!targetCollection) {
      addToast({
        type: 'error',
        title: 'Permission Required',
        message: 'You need edit access to upload to this collection.',
        duration: 4000
      });
      return;
    }

    const captionValue = uploadCaption.trim() ? sanitizeTextInput(uploadCaption) : 'Shared family memory';
    const payload = {
      caption: captionValue,
      mediaType: pendingUpload.type,
      fileName: pendingUpload.metadata.name,
      size: pendingUpload.metadata.size,
      preview: pendingUpload.preview,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.email || 'family'
    };

    const sanitized = sanitizeMemoryData({
      prompt: `Family upload: ${pendingUpload.metadata.name}`,
      response: JSON.stringify(payload),
      type: 'visual',
      tags: ['family-upload', pendingUpload.type]
    });

    setIsUploadingMemory(true);

    try {
      const { data: createdMemory, error } = await addMemory(
        {
          prompt: sanitized.prompt,
          response: sanitized.response,
          date: new Date().toISOString(),
          type: sanitized.type,
          tags: sanitized.tags
        },
        userId
      );

      if (error || !createdMemory?.id) {
        throw new Error(error?.message || 'Unable to save memory');
      }

      const collectionResult = await collaborativeMemoryService.addMemoryToCollection(
        selectedUploadCollectionId,
        createdMemory.id
      );

      if (!collectionResult.success) {
        throw new Error(collectionResult.error);
      }

      addToast({
        type: 'success',
        title: 'Memory Uploaded',
        message: 'Your memory has been shared with the family collection.',
        duration: 4000
      });

      setPendingUpload(null);
      setUploadCaption('');
      await loadCollaborationData();
    } catch (error: any) {
      console.error('Error uploading family memory:', error);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: error?.message || 'Could not upload this memory. Please try again.',
        duration: 5000
      });
    } finally {
      setIsUploadingMemory(false);
    }
  }, [addToast, editableCollections, loadCollaborationData, pendingUpload, selectedUploadCollectionId, uploadCaption, user?.email, userId]);

  // Render a collection card
  const renderCollectionCard = (collection: CollectionWithDetails) => (
    <div key={collection.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{collection.title}</h3>
          {collection.description && (
            <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {collection.collaborators.length} collaborator{collection.collaborators.length === 1 ? '' : 's'}
        </div>
      </div>

      {collection.memoryDetails.length === 0 ? (
        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-600">No memories yet. Add a memory to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {collection.memoryDetails.map((memory) => {
            const parsed = parseMemoryContent(memory);
            return (
              <div key={memory.id} className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                <p className="text-sm font-semibold text-gray-800 mb-1">{memory.prompt}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{parsed.caption}</p>
                  {parsed.mediaType === 'image' && parsed.preview && (
                    <img
                      src={parsed.preview}
                      alt={parsed.fileName || 'Shared memory'}
                      className="h-40 w-full rounded-2xl object-cover border border-white/60 shadow-inner"
                    />
                  )}
                  {parsed.mediaType === 'video' && parsed.preview && (
                    <video
                      controls
                      src={parsed.preview}
                      className="w-full rounded-2xl border border-white/60 shadow-inner"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {parsed.mediaType === 'document' && (
                    <p className="text-xs text-gray-500">Attachment: {parsed.fileName || 'Document'}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Share Your Legacy</h1>
      </div>

      <div className="flex justify-end">
        <button
          className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-2 px-6 rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleOpenInvite}
          disabled={collections.length === 0}
        >
          <Plus className="w-5 h-5" />
          <span>Invite Family</span>
        </button>
      </div>

      {editableCollections.length > 0 ? (
        <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Contribute a Memory</h2>
          <p className="text-sm text-gray-600">
            Upload a photo or short video with a caption to share with your family collection.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700" htmlFor="upload-collection-select">
                Choose collection
              </label>
              <select
                id="upload-collection-select"
                value={selectedUploadCollectionId ?? ''}
                onChange={(event) => setSelectedUploadCollectionId(event.target.value || null)}
                className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {editableCollections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700" htmlFor="upload-caption">
                Caption (Optional)
              </label>
              <textarea
                id="upload-caption"
                value={uploadCaption}
                onChange={(event) => setUploadCaption(event.target.value)}
                className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                rows={2}
                placeholder="Add a short caption or memory description..."
              />
            </div>
          </div>

          <FileUpload
            onFileProcessed={handleFileProcessed}
            acceptedTypes={['image/*', '.pdf', '.txt', 'video/*']}
            maxFileSize={20}
            multiple={false}
          />

          {pendingUpload && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">Ready to Upload</h3>
                  <button
                    onClick={() => setPendingUpload(null)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {pendingUpload.preview && (
                    <img
                      src={pendingUpload.preview}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-orange-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{pendingUpload.metadata.name}</p>
                    <p className="text-sm text-gray-500">
                      {(pendingUpload.metadata.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <textarea
                  id="upload-caption"
                  value={uploadCaption}
                  onChange={(event) => setUploadCaption(event.target.value)}
                  className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 mt-3"
                  rows={2}
                  placeholder="Add a short caption or memory description..."
                />
              </div>
              <button
                onClick={handleUploadMemory}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isUploadingMemory}
              >
                {isUploadingMemory ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  'Share Memory'
                )}
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Contribute a Memory</h2>
          <p className="text-sm text-gray-600">
            You currently have view-only access. Ask a collection owner to grant edit permissions so you can upload memories.
          </p>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Invitations for You</h2>
            {incomingInvites.length === 0 ? (
              <p className="text-sm text-gray-600">No pending invitations.</p>
            ) : (
              <div className="space-y-3">
                {incomingInvites.map((invite) => (
                  <div key={invite.id} className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{invite.collaborative_collections?.title || 'Shared Collection'}</p>
                        <p className="text-xs text-gray-500">Invited by {invite.inviter?.full_name || 'a family member'}</p>
                      </div>
                      <p className="text-xs text-gray-500">Expires {new Date(invite.expires_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => handleRespondToInvite(invite.id, 'accept')}
                        disabled={respondingInviteId === invite.id}
                      >
                        {respondingInviteId === invite.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        Accept
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-xl bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => handleRespondToInvite(invite.id, 'decline')}
                        disabled={respondingInviteId === invite.id}
                      >
                        {respondingInviteId === invite.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Invitations You Sent</h2>
            {sentInvites.length === 0 ? (
              <p className="text-sm text-gray-600">You haven't invited anyone yet.</p>
            ) : (
              <div className="space-y-3">
                {sentInvites.map((invite) => (
                  <div key={invite.id} className="rounded-2xl border border-orange-100 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{invite.invited_user_email}</p>
                          <p className="text-xs text-gray-500">{(invite as any).collaborative_collections?.title || 'Shared Collection'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 uppercase">{invite.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Collaborative Collections</h2>
            {collections.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-lg border border-orange-100">
                <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Collections Yet</h3>
                <p className="text-gray-600 mb-4">Create a collection to start collaborating with family.</p>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="py-3 px-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Create Collection
                </button>
              </div>
            ) : (
              <div className="space-y-4">{collections.map(renderCollectionCard)}</div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Memories Shared With You</h2>
            {sharedMemories.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-lg border border-orange-100">
                <div className="text-5xl mb-4">📸</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Shared Memories</h3>
                <p className="text-gray-600 mb-4">When someone shares a memory with you it will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedMemories.map((shared) => {
                  const parsed = parseMemoryContent(shared.memory);
                  return (
                    <div key={shared.id} className="rounded-2xl border border-orange-100 bg-white/80 p-5 shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">{shared.memory.prompt}</p>
                          <p className="text-xs text-gray-500">Permission: {shared.permission_level}</p>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(shared.shared_at).toLocaleDateString()}</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">{parsed.caption}</p>
                        {parsed.mediaType === 'image' && parsed.preview && (
                          <img
                            src={parsed.preview}
                            alt={parsed.fileName || 'Shared memory'}
                            className="h-40 w-full rounded-2xl object-cover border border-white/60 shadow-inner"
                          />
                        )}
                        {parsed.mediaType === 'video' && parsed.preview && (
                          <video
                            controls
                            src={parsed.preview}
                            className="w-full rounded-2xl border border-white/60 shadow-inner"
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                        {parsed.mediaType === 'document' && (
                          <p className="text-xs text-gray-500">Attachment: {parsed.fileName || 'Document'}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
      </section>
        </>
      )}

      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-gray-200 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Close invite dialog"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Invite a family member</h2>
            <p className="text-sm text-gray-600 mb-4">Share your memories with the people who matter most.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="collection-select">Collection</label>
                <select
                  id="collection-select"
                  value={activeCollectionId ?? ''}
                  onChange={(event) => setActiveCollectionId(event.target.value || null)}
                  className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="invite-email">Email address</label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteData.email}
                  onChange={(event) => setInviteData((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="family@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="permission-level">Permission level</label>
                <select
                  id="permission-level"
                  value={inviteData.permission}
                  onChange={(event) => setInviteData((prev) => ({ ...prev, permission: event.target.value as 'view' | 'edit' }))}
                  className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="view">View only</option>
                  <option value="edit">Can contribute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="invite-message">Message (optional)</label>
                <textarea
                  id="invite-message"
                  value={inviteData.message}
                  onChange={(event) => setInviteData((prev) => ({ ...prev, message: event.target.value }))}
                  className="w-full rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  rows={3}
                  placeholder="Add a personal message to your invitation..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 py-3 rounded-2xl font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3 rounded-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleSendInvite}
                  disabled={isSubmittingInvite}
                >
                  {isSubmittingInvite ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invite'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteCollaborate;