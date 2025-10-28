
import { useState, useEffect, type FC } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';
import { useAppState } from '../lib/AppStateContext';
import { collaborativeMemoryService, CollaborativeMemory, CollaborationInvite } from '../lib/collaborativeMemoryService';
import { ChevronLeft, Plus, UserPlus, Check, X, Users, Share2, Clock, Settings } from 'lucide-react';

const CollaborativeCollections: FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { addToast } = useError();
  const { dispatch } = useAppState();
  const [collections, setCollections] = useState<CollaborativeMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState<string | null>(null);
  const [invites, setInvites] = useState<CollaborationInvite[]>([]);

  // Create collection form state
  const [newCollection, setNewCollection] = useState({
    title: '',
    description: '',
    isPublic: false
  });

  // Invite form state
  const [inviteData, setInviteData] = useState({
    email: '',
    permission: 'view' as 'view' | 'edit',
    message: ''
  });

  useEffect(() => {
    loadCollections();
    loadInvites();
  }, [user?.id]);

  const loadCollections = async () => {
    if (!user?.id) return;

    try {
      const result = await collaborativeMemoryService.getUserCollaborativeCollections(user.id);
      if (result.data) {
        setCollections(result.data);
      }
    } catch (error: any) {
      console.error('Error loading collections:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load collaborative collections.',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    // In a real implementation, we'd fetch pending invites from the database
    // For now, we'll show an empty list
    setInvites([]);
  };

  const handleCreateCollection = async () => {
    if (!newCollection.title.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Collection title is required.',
        duration: 4000
      });
      return;
    }

    try {
      const result = await collaborativeMemoryService.createCollaborativeCollection(
        newCollection.title,
        newCollection.description,
        newCollection.isPublic
      );

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Collection Created',
          message: `"${newCollection.title}" has been created successfully.`,
          duration: 4000
        });

        setNewCollection({ title: '', description: '', isPublic: false });
        setShowCreateForm(false);
        await loadCollections();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: error.message || 'Failed to create collection.',
        duration: 5000
      });
    }
  };

  const handleSendInvite = async (collectionId: string) => {
    if (!inviteData.email.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Email address is required.',
        duration: 4000
      });
      return;
    }

    try {
      const result = await collaborativeMemoryService.inviteUserToCollection(
        collectionId,
        inviteData.email,
        inviteData.permission,
        inviteData.message
      );

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Invite Sent',
          message: `Invitation sent to ${inviteData.email}.`,
          duration: 4000
        });

        setInviteData({ email: '', permission: 'view', message: '' });
        setShowInviteForm(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Invite Failed',
        message: error.message || 'Failed to send invitation.',
        duration: 5000
      });
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const result = await collaborativeMemoryService.acceptCollaborationInvite(inviteId);

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Invite Accepted',
          message: 'You have joined the collaborative collection.',
          duration: 4000
        });

        await loadCollections();
        await loadInvites();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Accept Failed',
        message: error.message || 'Failed to accept invitation.',
        duration: 5000
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      dispatch({ type: 'SET_DETAIL_VIEW', payload: null });
    }
  };

  if (loading) {
    return (
      <div className="pt-6 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100 hover:bg-orange-50 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Collaborative Collections</h1>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100 hover:bg-orange-50 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Collaborative Collections</h1>
            <p className="text-sm text-gray-600">Share memories with family and friends</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Collection
        </button>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Invites</h2>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">Invited to collaborate</p>
                    <p className="text-sm text-gray-600">Expires: {new Date(invite.expires_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((collection) => (
          <div key={collection.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{collection.title}</h3>
                {collection.description && (
                  <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                )}
              </div>
              <button
                onClick={() => setShowInviteForm(collection.id)}
                className="w-8 h-8 flex items-center justify-center bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                aria-label="Invite collaborators"
              >
                <UserPlus className="w-4 h-4 text-orange-600" />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{collection.collaborators.length} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  <span>{collection.shared_memories.length} memories</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(collection.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all">
                Open Collection
              </button>
              <button className="px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {collections.length === 0 && (
          <div className="col-span-full bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-orange-100 text-center">
            <Users className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Collaborative Collections</h3>
            <p className="text-gray-600 mb-6">Create your first collection to start sharing memories with family and friends.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Create Your First Collection
            </button>
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Create Collaborative Collection</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Title *
                </label>
                <input
                  type="text"
                  value={newCollection.title}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Family Memories 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this collection is about..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newCollection.isPublic}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Make this collection public
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Invite Collaborator</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="friend@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Level
                </label>
                <select
                  value={inviteData.permission}
                  onChange={(e) => setInviteData(prev => ({ ...prev, permission: e.target.value as 'view' | 'edit' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="view">View Only - Can see memories</option>
                  <option value="edit">Edit - Can add and modify memories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Share a personal message with your invitation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteForm(null)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendInvite(showInviteForm)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeCollections;
