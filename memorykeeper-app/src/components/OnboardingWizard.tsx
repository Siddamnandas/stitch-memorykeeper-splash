import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useError } from '../lib/ErrorContext';
import { useAppState } from '../lib/AppStateContext';
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    age: 75,
    avatarChoice: '',
    themePreference: 'Nostalgic',
    memoryGoals: [] as string[],
    preferredGames: [] as string[],
    notificationPreferences: {
      emailReminders: true,
      pushNotifications: true,
      weeklyProgress: true
    },
    consentAnalysis: false,
    consentSummaries: false,
    familyInvites: [] as string[]
  });
  const [pendingInviteEmail, setPendingInviteEmail] = useState('');

  const { dispatch } = useAppState();
  const { user, updateProfile, completeOnboarding, profile } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useError();

  const avatarOptions = useMemo(
    () => [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCeW0K825tSHTOFLVjt4RJuHWeiQUAScsjefQkGG69fd-OCCDkCBJQbJJW84VvOiPWdPfTAmOgUf5fRmAqjeZ8TC8L1jYiEsHG0CXsFlf1fPOdeDWRFXyslF38PLSb6Yiawz4zyghK9PbTQNIrW05k4bE94lpbD-z6C40GdpwCRbTaYXZ8xsUuV9ZcK-LwYmykoP5NvumqtASjGQ-HUyyZD6MV6UlMF1MoN5NLOspJpZJXYVDWRUyW7EiuVFgXt04rTD0EbT2q2Kto',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDsfOU4yaRaiQ4E0_JijA4PUs0pRfokl5TZAk52ccVRSE0BnpXPkThVwnKszLvTa3DUkaoZa3UYwVOPff-tPzPXoq-iMn1ET_96TXZ5dDBuyQAly23XTxauMUV5yG6EkERRLNn1rVqvpHPEBpsW1zh59fjdnxJ-b3DIFF9O5bIzpWYW2JU8dKfHrQ8d1uelf1uJR92lNdRm-TqhMH4gfz-EBoXR1mvbg-cdS1kn69sBLe8pn3ykzKJTnovmH3PRuwzUZnkX4YWyre0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAX6ITAG-dmy4A27VaOOvbddKpDGbJGUvaYKJh1VBGL_BNSSaHW42fcS4aH6nw9nda8lT3r1Ywd2IyohWdA0yB6p4ZoIArAM75ES8Q_Kjm5WKMmAkupLknZvJCa3WHFCBZzu1DBRtgai5a5_gGpgRwvEIbpcMJthmtWk20H8sNge7usJ6yEDXB9fa7XjICTncvd6t2vPfHKs4v0vwFUyTi3Gbd-x0azWBZ6oYiNYWdm0CPVW2Qrj0xMDn0yPW-83m8R5n0FEs2Uwhg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA6lJdVS8trAW1Fowy1bZVMTZYpMIJoZJBaH_KHn3zdJaVN0ybJakCD-L6QTCUWt2po2T0hXZrS0YoGXnLAU3uHL2kU0NV-jCHxXVKPBVGZnQm7th7x903CmWON4xan5twzgIztZpD1yxHT2zKAZZch7wNZxI2nJh2cqB234bw7ZeZBMiZlwYH2Rpb0c2ZMyu1jrAlmxUAmkdU10GlYxrUZ3LasZKyH6Yfb_Gma2-3jY3lg'
    ],
    []
  );

  const themeOptions = useMemo(
    () => [
      {
        key: 'Nostalgic',
        label: 'Nostalgic',
        description: 'Warm sepia tones with gentle gradients',
        gradient: 'from-amber-200 to-orange-200'
      },
      {
        key: 'Fun',
        label: 'Fun',
        description: 'Bright cheerful colors for playful energy',
        gradient: 'from-pink-300 to-purple-300'
      },
      {
        key: 'High Contrast',
        label: 'High Contrast',
        description: 'Bold contrasts for maximum readability',
        gradient: 'from-slate-900 to-slate-600'
      },
      {
        key: 'Dark Mode',
        label: 'Dark Mode',
        description: 'Soft, dusk-like palette for evening use',
        gradient: 'from-zinc-800 to-zinc-600'
      }
    ],
    []
  );

  const totalSteps = 7;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMemoryGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      memoryGoals: prev.memoryGoals.includes(goal)
        ? prev.memoryGoals.filter(g => g !== goal)
        : [...prev.memoryGoals, goal]
    }));
  };

  const handleGamePreferenceToggle = (game: string) => {
    setFormData(prev => ({
      ...prev,
      preferredGames: prev.preferredGames.includes(game)
        ? prev.preferredGames.filter(g => g !== game)
        : [...prev.preferredGames, game]
    }));
  };

  const handleNotificationToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [preference]: !prev.notificationPreferences[preference as keyof typeof prev.notificationPreferences]
      }
    }));
  };

  const handleAvatarSelect = (avatar: string) => {
    setFormData(prev => ({
      ...prev,
      avatarChoice: avatar
    }));
  };

  const handleThemeSelect = (theme: string) => {
    setFormData(prev => ({
      ...prev,
      themePreference: theme
    }));
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleAddInvite = () => {
    const email = pendingInviteEmail.trim();
    if (!email) return;
    if (!validateEmail(email)) {
      addToast({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        duration: 4000
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      familyInvites: Array.from(new Set([...prev.familyInvites, email.toLowerCase()]))
    }));
    setPendingInviteEmail('');
  };

  const handleRemoveInvite = (email: string) => {
    setFormData(prev => ({
      ...prev,
      familyInvites: prev.familyInvites.filter(item => item !== email)
    }));
  };

  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 2:
        return !formData.fullName.trim() || Number.isNaN(formData.age) || formData.age <= 0;
      case 3:
        return !formData.avatarChoice || !formData.themePreference;
      default:
        return false;
    }
  }, [formData.avatarChoice, formData.age, formData.fullName, formData.themePreference, step]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => Math.min(totalSteps, prev + 1));
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => Math.max(1, prev - 1));
    }
  };

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      fullName: profile.full_name || prev.fullName,
      age: profile.age ?? prev.age,
      avatarChoice: profile.avatar_choice || prev.avatarChoice,
      themePreference: profile.theme_preference || prev.themePreference,
      memoryGoals: profile.memory_goals || prev.memoryGoals,
      preferredGames: profile.preferred_games || prev.preferredGames,
      notificationPreferences: profile.notification_preferences || prev.notificationPreferences,
      consentAnalysis: profile.ai_consent_analysis ?? prev.consentAnalysis,
      consentSummaries: profile.ai_consent_summaries ?? prev.consentSummaries,
      familyInvites: profile.invited_family_emails || prev.familyInvites
    }));
  }, [profile]);

  const finalizeOnboarding = useCallback(() => {
    try {
      localStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.warn('Unable to persist onboarding completion flag:', error);
    }
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  }, [dispatch]);

  const handleComplete = async () => {
    try {
      const inviteEmails = Array.from(new Set(formData.familyInvites.map(email => email.trim().toLowerCase()))).filter(Boolean);

      // Update profile with onboarding data
      await updateProfile({
        full_name: formData.fullName,
        avatar_choice: formData.avatarChoice || undefined,
        age: formData.age,
        theme_preference: formData.themePreference,
        memory_goals: formData.memoryGoals,
        preferred_games: formData.preferredGames,
        notification_preferences: formData.notificationPreferences,
        ai_consent_analysis: formData.consentAnalysis,
        ai_consent_summaries: formData.consentSummaries,
        invited_family_emails: inviteEmails
      });

      // Mark onboarding as complete
      await completeOnboarding();
      finalizeOnboarding();

      addToast({
        type: 'success',
        title: 'Welcome to MemoryKeeper!',
        message: 'Your profile has been set up successfully.',
        duration: 4000
      });

      navigate('/memory-keeper-main');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Setup Failed',
        message: 'There was an error completing your setup. Please try again.',
        duration: 5000
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to MemoryKeeper!</h2>
            <p className="text-gray-600 mb-6">
              Let's personalize your experience with a quick setup. This will help us tailor prompts, games, and reminders to your goals.
            </p>
            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <p className="text-blue-800 text-sm">
                <strong>What you'll set up:</strong> Your profile, favorite themes, memory goals, game preferences, privacy consent, and optional family invites.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-4-9a4 4 0 11-8 0" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Tell us about you</h2>
            <p className="text-gray-600 mb-6 text-center">
              We'll use this to personalize your experience and adjust recommendations to your stage of life.
            </p>
            <div className="max-w-md mx-auto space-y-6">
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full p-4 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none transition-all text-lg"
                placeholder="Enter your full name"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="age-input">
                  Age
                </label>
                <input
                  id="age-input"
                  type="number"
                  min={40}
                  max={120}
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', Number(e.target.value))}
                  className="w-full p-4 bg-white rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 outline-none transition-all text-lg"
                  placeholder="e.g., 72"
                />
                <p className="mt-2 text-sm text-gray-500 text-center">You can update this later in your profile settings.</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.955 11.955 0 0012 20.055a11.955 11.955 0 00-6.825-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Choose your style</h2>
            <p className="text-gray-600 mb-6 text-center">
              Pick an avatar and theme that feel like you. You can change these anytime.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-8">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    formData.avatarChoice === avatar
                      ? 'border-orange-400 bg-orange-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <img src={avatar} alt="Avatar option" className="w-20 h-20 rounded-2xl object-cover" />
                  <span className="text-sm font-medium text-gray-700">Avatar</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              {themeOptions.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => handleThemeSelect(theme.key)}
                  className={`w-full rounded-2xl p-4 border-2 transition-all text-left ${
                    formData.themePreference === theme.key
                      ? 'border-orange-400 bg-orange-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <div className={`h-20 w-full rounded-2xl mb-3 bg-gradient-to-r ${theme.gradient}`}></div>
                  <p className="text-lg font-semibold text-gray-800">{theme.label}</p>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">What are your memory goals?</h2>
            <p className="text-gray-600 mb-6 text-center">
              Select all that apply to help us customize your experience.
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {[
                'Improve daily memory recall',
                'Remember names and faces better',
                'Keep track of important dates',
                'Enhance learning and studying',
                'Maintain cognitive health',
                'Challenge myself with games'
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleMemoryGoalToggle(goal)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.memoryGoals.includes(goal)
                      ? 'bg-orange-100 border-orange-400 text-orange-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.memoryGoals.includes(goal)
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.memoryGoals.includes(goal) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{goal}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13m-4 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Which games interest you?</h2>
            <p className="text-gray-600 mb-6 text-center">
              We'll prioritize these games in your personalized experience.
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {[
                'Echo Echo (Sound Memory)',
                'Legacy Link (Word Association)',
                'Snapshot Solve (Visual Puzzles)',
                'Story Quiz Quest (Narrative Memory)',
                'Memory Matchup (Card Matching)',
                'Timeline Tango (Chronological Order)'
              ].map((game) => (
                <button
                  key={game}
                  onClick={() => handleGamePreferenceToggle(game)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.preferredGames.includes(game)
                      ? 'bg-orange-100 border-orange-400 text-orange-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.preferredGames.includes(game)
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.preferredGames.includes(game) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{game}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.445L4 21l4.868-2.317z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Stay in the loop</h2>
            <p className="text-gray-600 mb-6 text-center">
              Choose how you'd like to receive reminders and updates, and let us know how we can use AI to support you.
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              {[
                { key: 'emailReminders', label: 'Email reminders for memory practice' },
                { key: 'pushNotifications', label: 'Push notifications for game suggestions' },
                { key: 'weeklyProgress', label: 'Weekly progress reports' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <button
                    onClick={() => handleNotificationToggle(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.notificationPreferences[key as keyof typeof formData.notificationPreferences]
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.notificationPreferences[key as keyof typeof formData.notificationPreferences]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800">AI Privacy & Consent</h3>
              <p className="text-sm text-gray-600">We use AI to craft prompts and summaries. Choose the ways you're comfortable with.</p>
              <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.consentAnalysis}
                  onChange={(e) => handleInputChange('consentAnalysis', e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-700">
                  I consent to AI analysing my memories to improve prompts and game suggestions.
                </span>
              </label>
              <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.consentSummaries}
                  onChange={(e) => handleInputChange('consentSummaries', e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-700">
                  I consent to AI generating shareable summaries of my memories.
                </span>
              </label>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v11H3V10a2 2 0 012-2h2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v3m0 0v3m0-3h3m-3 0H9m3-5a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Invite your family</h2>
            <p className="text-gray-600 mb-6 text-center">
              Invite loved ones to follow along. You can skip this step or add more later.
            </p>
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={pendingInviteEmail}
                  onChange={(e) => setPendingInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInvite();
                    }
                  }}
                  className="flex-1 p-3 bg-white rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none transition-all"
                  placeholder="family@example.com"
                />
                <button
                  type="button"
                  onClick={handleAddInvite}
                  className="px-4 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-semibold shadow hover:shadow-lg transition-all"
                >
                  Add
                </button>
              </div>

              {formData.familyInvites.length > 0 && (
                <div className="space-y-2">
                  {formData.familyInvites.map((email) => (
                    <div key={email} className="flex items-center justify-between px-4 py-3 bg-orange-50 rounded-2xl border border-orange-200">
                      <span className="text-sm font-medium text-orange-800">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInvite(email)}
                        className="text-sm text-orange-600 hover:text-orange-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-green-800 text-sm text-center">
                  🎉 You're all set! Click "Complete Setup" to start your memory journey.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-100 w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="bg-orange-200 h-2 rounded-full">
            <div
              className="bg-gradient-to-r from-orange-500 to-rose-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[400px] flex flex-col">
          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-auto pt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-3 rounded-2xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {step === totalSteps ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
