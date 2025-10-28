import React, { useMemo } from 'react';
import { Brain, TrendingUp, Target, Users, Zap, Award, Calendar, Activity, ChevronLeft, BarChart3 } from 'lucide-react';
import { useAppState } from '../lib/AppStateContext';
import { useAuth } from '../lib/AuthContext';
import { MemoryStrengthFactors, MemoryActivity } from '../lib/memoryStrengthService';

interface MemoryStrengthBreakdownProps {
  onBack?: () => void;
}

const MemoryStrengthBreakdown: React.FC<MemoryStrengthBreakdownProps> = ({ onBack }) => {
  const { state, dispatch } = useAppState();
  const { profile } = useAuth();

  const derivedActivities = useMemo<MemoryActivity[]>(() => {
    const memoryActivities = state.memories.slice(0, 5).map((memory) => ({
      type: 'memory_added' as MemoryActivity['type'],
      timestamp: new Date(memory.date),
      value: Math.min(20, Math.max(5, Math.round((memory.response?.length || 0) / 40))),
      metadata: { memoryId: memory.id }
    }));

    const streakActivity: MemoryActivity[] =
      state.streakCount > 1
        ? [
            {
              type: 'streak_maintained',
              timestamp: new Date(),
              value: Math.min(25, state.streakCount * 2),
              metadata: { streakDays: state.streakCount }
            }
          ]
        : [];

    return [...memoryActivities, ...streakActivity].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [state.memories, state.streakCount]);

  const factors = useMemo<MemoryStrengthFactors>(() => {
    if (state.memories.length === 0) {
      return {
        consistency: 0,
        activityCount: 0,
        recentActivity: 0,
        engagementDepth: 0,
        activityDiversity: 0,
        progressStreak: Math.min(100, state.streakCount * 14.28),
        challengeLevel: Math.min(100, state.memoryStrength),
        socialEngagement: Math.min(100, (profile?.invited_family_emails?.length ?? 0) * 20)
      };
    }

    const memoryDates = state.memories
      .map((memory) => new Date(memory.date))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    const uniqueDays = new Set(memoryDates.map((date) => date.toDateString()));
    const spanDays =
      memoryDates.length > 1
        ? Math.max(
            1,
            Math.round(
              (memoryDates[memoryDates.length - 1].getTime() - memoryDates[0].getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
          )
        : 1;

    const consistency = Math.min(100, (uniqueDays.size / spanDays) * 100);
    const activityCount = Math.min(100, state.memories.length * 5);

    const lastMemoryDate = memoryDates[memoryDates.length - 1] ?? new Date();
    const daysSinceLast = (Date.now() - lastMemoryDate.getTime()) / (1000 * 60 * 60 * 24);
    const recentActivity = Math.max(0, 100 - Math.min(100, daysSinceLast * 25));

    const averageLength =
      state.memories.reduce((total, memory) => total + (memory.response?.length || 0), 0) /
      state.memories.length;
    const engagementDepth = Math.min(100, averageLength / 6);

    const typeSet = new Set(state.memories.map((memory) => memory.type || 'text'));
    const activityDiversity = Math.min(100, (typeSet.size / 4) * 100);

    const progressStreak = Math.min(100, state.streakCount * 14.28);
    const challengeLevel = Math.min(100, state.memoryStrength);

    const socialConnections = profile?.invited_family_emails?.length ?? 0;
    const sharedMemories = state.memories.filter((memory) =>
      (memory.tags || []).some((tag) => tag.toLowerCase().includes('share'))
    ).length;
    const socialEngagement = Math.min(100, socialConnections * 20 + sharedMemories * 5);

    return {
      consistency,
      activityCount,
      recentActivity,
      engagementDepth: Number.isFinite(engagementDepth) ? engagementDepth : 0,
      activityDiversity,
      progressStreak,
      challengeLevel,
      socialEngagement
    };
  }, [profile?.invited_family_emails?.length, state.memories, state.memoryStrength, state.streakCount]);

  const recentActivities = useMemo(() => derivedActivities.slice(0, 5), [derivedActivities]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      dispatch({ type: 'SET_DETAIL_VIEW', payload: null });
    }
  };

  const getFactorIcon = (factorKey: keyof MemoryStrengthFactors) => {
    const icons = {
      consistency: Calendar,
      activityCount: Activity,
      recentActivity: TrendingUp,
      engagementDepth: Target,
      activityDiversity: Zap,
      progressStreak: Award,
      challengeLevel: Brain,
      socialEngagement: Users
    };
    return icons[factorKey] || BarChart3;
  };

  const getFactorDescription = (factorKey: keyof MemoryStrengthFactors): string => {
    const descriptions = {
      consistency: 'How regularly you engage with memories',
      activityCount: 'Total number of memory activities',
      recentActivity: 'How recently you\'ve been active',
      engagementDepth: 'Quality and depth of your engagement',
      activityDiversity: 'Variety of different memory activities',
      progressStreak: 'Consecutive days of memory practice',
      challengeLevel: 'Difficulty level of games completed',
      socialEngagement: 'Sharing and collaborative activities'
    };
    return descriptions[factorKey] || 'Memory strength factor';
  };

  const getActivityIcon = (activityType: MemoryActivity['type']) => {
    const icons = {
      memory_added: Brain,
      memory_imported: TrendingUp,
      game_completed: Target,
      memory_reviewed: Activity,
      daily_login: Calendar,
      game_perfect_score: Award,
      memory_shared: Users,
      streak_maintained: Zap
    };
    return icons[activityType] || Activity;
  };

  const formatActivityDescription = (activity: MemoryActivity): string => {
    switch (activity.type) {
      case 'memory_added':
        return 'Added a new memory';
      case 'memory_imported':
        return `Imported from ${activity.metadata?.importSource || 'file'}`;
      case 'game_completed':
        return `Completed ${activity.metadata?.gameType || 'game'} (${activity.metadata?.difficulty || 'normal'})`;
      case 'memory_reviewed':
        return 'Reviewed existing memories';
      case 'daily_login':
        return 'Daily login bonus';
      case 'game_perfect_score':
        return `Perfect score on ${activity.metadata?.gameType || 'game'}!`;
      case 'memory_shared':
        return 'Shared memories with others';
      case 'streak_maintained':
        return `${activity.metadata?.streakDays || 0} day streak maintained`;
      default:
        return 'Memory activity';
    }
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="pt-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100 hover:bg-orange-50 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Memory Strength Analysis</h1>
          <p className="text-sm text-gray-600">Detailed breakdown of your memory progress</p>
        </div>
      </div>

      {/* Current Strength Overview */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Current Strength: {state.memoryStrength}/100</h2>
            <p className="text-gray-600">Keep up the great work to maintain and improve your memory!</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-orange-400 to-rose-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${state.memoryStrength}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
            <span>Expert</span>
          </div>
        </div>
      </div>

      {/* Strength Factors Breakdown */}
      {factors && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Strength Factors</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(factors).map(([key, value]) => {
              const IconComponent = getFactorIcon(key as keyof MemoryStrengthFactors);
              const description = getFactorDescription(key as keyof MemoryStrengthFactors);

              return (
                <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-orange-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-bold text-orange-600">{Math.round(value)}/100</span>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>

                    {/* Factor Progress Bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activities</h2>

        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              const description = formatActivityDescription(activity);
              const timeAgo = formatTimeAgo(activity.timestamp);

              return (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{description}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">{timeAgo}</span>
                      <span className="text-sm font-semibold text-green-600">+{activity.value} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent activities yet</p>
            <p className="text-sm text-gray-400 mt-2">Start adding memories and playing games to see your activity here!</p>
          </div>
        )}
      </div>

      {/* Tips for Improvement */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Tips to Improve Memory Strength</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                <span className="text-orange-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Stay Consistent</h3>
                <p className="text-sm text-gray-600">Try to engage with memories daily to build strong habits.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                <span className="text-orange-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Challenge Yourself</h3>
                <p className="text-sm text-gray-600">Play harder difficulty levels in memory games.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                <span className="text-orange-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Share Memories</h3>
                <p className="text-sm text-gray-600">Collaborate with family and friends to strengthen social connections.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                <span className="text-orange-600 font-bold text-sm">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Try Different Activities</h3>
                <p className="text-sm text-gray-600">Mix up your routine with various games and memory exercises.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                <span className="text-orange-600 font-bold text-sm">5</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Maintain Streaks</h3>
                <p className="text-sm text-gray-600">Build consecutive days of activity for bonus points.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                <span className="text-orange-600 font-bold text-sm">6</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Review Regularly</h3>
                <p className="text-sm text-gray-600">Periodically review your existing memories to reinforce them.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryStrengthBreakdown;
