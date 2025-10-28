import { useState, useEffect, type FC } from 'react';
import { ChevronLeft, Plus, Image, Video, Mic, UserPlus, Save, Users, MessageCircle, Heart, Share2, Mail, Link, Check, X, Clock, Edit } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { collaborativeMemoryService } from '../lib/collaborativeMemoryService';

interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  relationship: string;
  status: 'connected' | 'pending' | 'invited';
  sharedMemories: number;
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: 'added_memory' | 'commented' | 'shared' | 'approved' | 'declined';
  target: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface PendingContribution {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'photo' | 'video' | 'text' | 'audio';
  content: string;
  caption: string;
  date: string;
  relatedPeople: string[];
  timestamp: string;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  memoryId: string;
}

const PLACEHOLDER_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGex1pX93qBbizGrdKH51pL50dkK1pYVYeDl-jBpxT5AWJ6xDM2D847ZTKkaLBCVXWtdVnOvuKCPLz7Hxoh4YyR66U_Yd3XQoJG8si9PcqMgUtlbKBnIQISsjSwVHjXVdqm9-CR_5N3wkNGigpRybhW-ZmBoszQWkL3MBeDgFciIJGZViCWhsO0jUsSY0TvPAtEbLfOZBIqERmFT69xGf5lbSqjL4Ao2BZHzGatQINlKmQZ5V3FE_bCJ_mBeuAmA1BnGvaVrv7d0M';

const CollaborativeMemory: FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const userEmail = user?.email || '';
  const [activeTab, setActiveTab] = useState<'family' | 'activity' | 'shared' | 'pending'>('family');
  const [newComment, setNewComment] = useState('');
  const [likedMemories, setLikedMemories] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [inviteMethod, setInviteMethod] = useState<'email' | 'link'>('email');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Mock family members data
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Jennifer',
      avatar: PLACEHOLDER_AVATAR,
      relationship: 'Daughter',
      status: 'connected',
      sharedMemories: 12
    },
    {
      id: '2',
      name: 'Michael',
      avatar: PLACEHOLDER_AVATAR,
      relationship: 'Son',
      status: 'pending',
      sharedMemories: 0
    },
    {
      id: '3',
      name: 'Emma',
      avatar: PLACEHOLDER_AVATAR,
      relationship: 'Granddaughter',
      status: 'connected',
      sharedMemories: 5
    }
  ]);

  // Mock activity feed data
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Jennifer',
      userAvatar: PLACEHOLDER_AVATAR,
      action: 'added_memory',
      target: "Mom's 75th Birthday Party",
      content: 'Added a new photo',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: '2',
      userId: '3',
      userName: 'Emma',
      userAvatar: PLACEHOLDER_AVATAR,
      action: 'commented',
      target: "Summer of '68",
      content: "I love this story, Grandma!",
      timestamp: 'Yesterday',
      read: true
    },
    {
      id: '3',
      userId: 'current',
      userName: 'You',
      userAvatar: PLACEHOLDER_AVATAR,
      action: 'shared',
      target: 'Wedding Day 1972',
      content: 'Shared with family',
      timestamp: '3 days ago',
      read: true
    }
  ]);

  // Mock pending contributions
  const [pendingContributions, setPendingContributions] = useState<PendingContribution[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Jennifer',
      userAvatar: PLACEHOLDER_AVATAR,
      type: 'photo',
      content: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6Xa6PIYrJVFAmDgm1pDK2DeY0iWkW-vIDXGx07EmFACCiAyvQBF-wF0h4AteLCfhdP846C_wC2H78W6pLGXVSHX8aC2daiuU30s4BhS4JXEAknt0P2-rcgio7iOsSPaiZBjou0iqPRN4Qi6-XCjS4xgW55wsTUVSoqH8YMrmL1tYu87DkqyMqcd2Q1AIf7r8wbRZXb2ueiVLsbKLIlICMSk8L6Gl7Ppxc1L_CPbCvnAGWJ5P3TRfESBEIsoC33bjvWXiqQZR_dTg',
      caption: 'Family reunion photo',
      date: '1985',
      relatedPeople: ['Margaret', 'Michael'],
      timestamp: '1 hour ago'
    }
  ]);

  // Mock comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Grandma',
      avatar: PLACEHOLDER_AVATAR,
      text: 'This is a wonderful memory to share!',
      timestamp: '2d',
      likes: 3,
      memoryId: '1'
    },
    {
      id: '2',
      author: 'Uncle Mark',
      avatar: PLACEHOLDER_AVATAR,
      text: 'I love the photos we added!',
      timestamp: '1d',
      likes: 5,
      memoryId: '2'
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadCollaborationData = async () => {
      try {
        setIsLoading(true);
        const [collectionsRes, sharedRes, invitesRes] = await Promise.all([
          collaborativeMemoryService.getUserCollaborativeCollections(user.id),
          collaborativeMemoryService.getSharedMemoriesWithMe(user.id),
          collaborativeMemoryService.getInvitesForUser(user.id, userEmail)
        ]);

        if (cancelled) {
          return;
        }

        if (collectionsRes.data && collectionsRes.data.length > 0) {
          const mappedMembers: FamilyMember[] = collectionsRes.data.map((collection: any) => {
            const ownerName = collection.profiles?.full_name;
            const permission = collection.permissions?.[user.id];
            return {
              id: collection.id,
              name: collection.title || 'Shared Collection',
              avatar: collection.profiles?.avatar_url || PLACEHOLDER_AVATAR,
              relationship: ownerName ? `${ownerName}'s collection` : 'Shared collection',
              status: permission === 'edit' || permission === 'admin' ? 'connected' : 'pending',
              sharedMemories: collection.shared_memories?.length ?? 0
            };
          });

          if (mappedMembers.length > 0) {
            setFamilyMembers(mappedMembers);
          }
        }

        if (sharedRes.data && sharedRes.data.length > 0) {
          const mappedActivities: Activity[] = sharedRes.data.map((share: any) => ({
            id: share.id,
            userId: share.shared_by_user_id,
            userName: share.profiles?.full_name || 'Family member',
            userAvatar: share.profiles?.avatar_url || PLACEHOLDER_AVATAR,
            action: 'shared',
            target: share.memories?.prompt || 'Shared memory',
            content: share.message || share.memories?.response || '',
            timestamp: new Date(share.created_at).toLocaleString(),
            read: true
          }));

          if (mappedActivities.length > 0) {
            setActivities(mappedActivities);

            const mappedComments: Comment[] = mappedActivities
              .filter((activity) => activity.content)
              .map((activity, index) => ({
                id: `${activity.id}-comment-${index}`,
                author: activity.userName,
                avatar: activity.userAvatar,
                text: activity.content,
                timestamp: activity.timestamp,
                likes: 0,
                memoryId: activity.id
              }));

            if (mappedComments.length > 0) {
              setComments(mappedComments);
            }
          }
        }

        if (invitesRes.data && invitesRes.data.length > 0) {
          const mappedPending: PendingContribution[] = invitesRes.data.map((invite: any) => ({
            id: invite.id,
            userId: invite.invited_by_user_id || '',
            userName: invite.inviter?.full_name || 'Family member',
            userAvatar: invite.inviter?.avatar_url || PLACEHOLDER_AVATAR,
            type: 'text',
            content: invite.message || 'New contribution awaiting review',
            caption: invite.collaborative_collections?.title || 'Shared collection',
            date: invite.expires_at
              ? new Date(invite.expires_at).toLocaleDateString()
              : new Date(invite.created_at).toLocaleDateString(),
            relatedPeople: [],
            timestamp: new Date(invite.created_at).toLocaleString()
          }));

          if (mappedPending.length > 0) {
            setPendingContributions(mappedPending);
          }
        }

        setLoadError(null);
      } catch (error) {
        console.error('Failed to load collaborative data:', error);
        if (!cancelled) {
          setLoadError('Unable to load the latest collaboration updates. Showing recent snapshot instead.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCollaborationData();

    return () => {
      cancelled = true;
    };
  }, [user?.id, userEmail]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `${comments.length + 1}`,
        author: user?.user_metadata?.full_name || 'You',
        avatar: user?.user_metadata?.avatar_url || PLACEHOLDER_AVATAR,
        text: newComment,
        timestamp: 'Just now',
        likes: 0,
        memoryId: 'current'
      };
      
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleInvite = () => {
    setShowInviteForm(true);
  };

  const sendInvite = () => {
    if (inviteMethod === 'email' && inviteEmail) {
      // In a real app, this would send an email invite
      console.log(`Sending invite to ${inviteEmail}`);
      alert(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
      setShowInviteForm(false);
    } else if (inviteMethod === 'link') {
      // In a real app, this would generate a shareable link
      const inviteLink = `${window.location.origin}/invite/${Math.random().toString(36).substring(2, 15)}`;
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied to clipboard!');
      setShowInviteForm(false);
    }
  };

  const handleSave = () => {
    // In a real app, this would save the memory
    console.log('Save clicked');
    alert('Memory saved successfully!');
  };

  const handleLikeMemory = (id: string) => {
    setLikedMemories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleLikeComment = (id: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddToMemory = (type: 'text' | 'photo' | 'video' | 'audio') => {
    console.log(`Adding ${type} to memory`);
    alert(`Add ${type} functionality would open here`);
  };

  const handleApproveContribution = (id: string) => {
    setPendingContributions(prev => prev.filter(contrib => contrib.id !== id));
    alert('Contribution approved and added to scrapbook!');
  };

  const handleDeclineContribution = (id: string) => {
    setPendingContributions(prev => prev.filter(contrib => contrib.id !== id));
    alert('Contribution declined.');
  };

  return (
    <div className="pt-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Family Circle</h1>
      </div>

      {isLoading && (
        <div className="bg-white/70 border border-orange-100 rounded-2xl p-3 mb-4 text-sm text-gray-600 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          Loading the latest collaboration updates…
        </div>
      )}

      {loadError && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded-2xl p-3 mb-4">
          {loadError}
        </div>
      )}
      
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6">
        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 rounded-2xl p-3 text-center">
            <Users className="w-6 h-6 text-orange-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-800">{familyMembers.filter(m => m.status === 'connected').length}</p>
            <p className="text-xs text-gray-600">Connected</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-3 text-center">
            <MessageCircle className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-800">{activities.filter(a => !a.read).length}</p>
            <p className="text-xs text-gray-600">Unread</p>
          </div>
          <div className="bg-rose-50 rounded-2xl p-3 text-center">
            <Heart className="w-6 h-6 text-rose-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-800">
              {comments.reduce((sum, comment) => sum + comment.likes, 0)}
            </p>
            <p className="text-xs text-gray-600">Likes</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-orange-200 mb-6">
          <button
            className={`pb-3 px-4 font-medium text-sm ${activeTab === 'family' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('family')}
          >
            Family
          </button>
          <button
            className={`pb-3 px-4 font-medium text-sm ${activeTab === 'activity' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity ({activities.filter(a => !a.read).length})
          </button>
          <button
            className={`pb-3 px-4 font-medium text-sm ${activeTab === 'shared' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('shared')}
          >
            Shared
          </button>
          <button
            className={`pb-3 px-4 font-medium text-sm ${activeTab === 'pending' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingContributions.length})
          </button>
        </div>
        
        {/* Family View */}
        {activeTab === 'family' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Connected Family</h2>
              <button 
                className="flex items-center gap-1 py-2 px-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl text-sm"
                onClick={handleInvite}
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 bg-orange-50/50 rounded-2xl">
                  <div 
                    className="w-12 h-12 rounded-full bg-cover bg-center" 
                    style={{backgroundImage: `url("${member.avatar}")`}}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.relationship}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'connected' ? 'bg-green-100 text-green-800' :
                        member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status === 'connected' ? 'Connected' :
                         member.status === 'pending' ? 'Pending' : 'Invited'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">
                        {member.sharedMemories} shared memories
                      </span>
                      <div className="flex gap-2">
                        <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                          View Shared
                        </button>
                        {member.status === 'pending' && (
                          <button className="text-gray-500 hover:text-gray-700 text-sm">
                            Resend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Activity View */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            
            {activities.map((activity) => (
              <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-2xl ${!activity.read ? 'bg-orange-50/50' : ''}`}>
                <div 
                  className="w-10 h-10 rounded-full bg-cover bg-center" 
                  style={{backgroundImage: `url("${activity.userAvatar}")`}}
                ></div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold text-gray-800 text-sm">{activity.userName}</p>
                    <p className="text-gray-500 text-xs">{activity.timestamp}</p>
                    {!activity.read && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">
                    {activity.action === 'added_memory' && `added a ${activity.content} to "${activity.target}"`}
                    {activity.action === 'commented' && `commented on "${activity.target}": "${activity.content}"`}
                    {activity.action === 'shared' && `shared "${activity.target}" with family`}
                    {activity.action === 'approved' && `approved a contribution to "${activity.target}"`}
                    {activity.action === 'declined' && `declined a contribution to "${activity.target}"`}
                  </p>
                  <div className="flex gap-3 mt-2">
                    <button className="text-xs text-orange-600 hover:text-orange-700">
                      View
                    </button>
                    <button className="text-xs text-orange-600 hover:text-orange-700">
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Shared Memories View */}
        {activeTab === 'shared' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Shared Memories</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="aspect-square rounded-2xl overflow-hidden bg-orange-100 border border-orange-200">
                  <div className="w-full h-full bg-cover bg-center" style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA6Xa6PIYrJVFAmDgm1pDK2DeY0iWkW-vIDXGx07EmFACCiAyvQBF-wF0h4AteLCfhdP846C_wC2H78W6pLGXVSHX8aC2daiuU30s4BhS4JXEAknt0P2-rcgio7iOsSPaiZBjou0iqPRN4Qi6-XCjS4xgW55wsTUVSoqH8YMrmL1tYu87DkqyMqcd2Q1AIf7r8wbRZXb2ueiVLsbKLIlICMSk8L6Gl7Ppxc1L_CPbCvnAGWJ5P3TRfESBEIsoC33bjvWXiqQZR_dTg")'
                  }}></div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-3 bg-orange-100 text-orange-700 font-bold rounded-2xl hover:bg-orange-200 transition-colors">
              Load More
            </button>
          </div>
        )}
        
        {/* Pending Approvals View */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Pending Approvals</h2>
            
            {pendingContributions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-600">No pending contributions</p>
              </div>
            ) : (
              pendingContributions.map((contribution) => (
                <div key={contribution.id} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full bg-cover bg-center" 
                      style={{backgroundImage: `url("${contribution.userAvatar}")`}}
                    ></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{contribution.userName}</p>
                      <p className="text-xs text-gray-600">wants to add a {contribution.type} to a memory</p>
                    </div>
                  </div>
                  
                  {contribution.type === 'photo' && (
                    <div className="mb-3 rounded-xl overflow-hidden">
                      <div 
                        className="w-full h-32 bg-cover bg-center" 
                        style={{backgroundImage: `url("${contribution.content}")`}}
                      ></div>
                    </div>
                  )}
                  
                  <p className="text-gray-700 text-sm mb-2">{contribution.caption}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                      {contribution.date}
                    </span>
                    {contribution.relatedPeople.map((person, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        {person}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">Submitted {contribution.timestamp}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
                      onClick={() => handleApproveContribution(contribution.id)}
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl"
                      onClick={() => handleDeclineContribution(contribution.id)}
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Add to Memory Section */}
        <div className="pt-6 border-t border-orange-100 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add to Memory</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <button 
                className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 hover:bg-orange-200 transition-colors"
                onClick={() => handleAddToMemory('text')}
              >
                <Plus className="w-6 h-6" />
              </button>
              <p className="text-gray-700 text-sm font-medium">Text</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <button 
                className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 hover:bg-orange-200 transition-colors"
                onClick={() => handleAddToMemory('photo')}
              >
                <Image className="w-6 h-6" />
              </button>
              <p className="text-gray-700 text-sm font-medium">Photo</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <button 
                className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 hover:bg-orange-200 transition-colors"
                onClick={() => handleAddToMemory('video')}
              >
                <Video className="w-6 h-6" />
              </button>
              <p className="text-gray-700 text-sm font-medium">Video</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <button 
                className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 hover:bg-orange-200 transition-colors"
                onClick={() => handleAddToMemory('audio')}
              >
                <Mic className="w-6 h-6" />
              </button>
              <p className="text-gray-700 text-sm font-medium">Audio</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Invite Family</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowInviteForm(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <button
                className={`flex-1 py-2 rounded-xl font-medium ${
                  inviteMethod === 'email' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setInviteMethod('email')}
              >
                Email
              </button>
              <button
                className={`flex-1 py-2 rounded-xl font-medium ${
                  inviteMethod === 'link' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setInviteMethod('link')}
              >
                Share Link
              </button>
            </div>
            
            {inviteMethod === 'email' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            ) : (
              <div className="mb-4 text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
                  <Link className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-gray-700">
                  A shareable link will be generated that you can send to your family member.
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200"
                onClick={() => setShowInviteForm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all"
                onClick={sendInvite}
                disabled={inviteMethod === 'email' && !inviteEmail}
              >
                {inviteMethod === 'email' ? 'Send Invite' : 'Generate Link'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          onClick={handleInvite}
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite</span>
        </button>
        <button 
          className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          onClick={handleSave}
        >
          <Save className="w-5 h-5" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default CollaborativeMemory;
