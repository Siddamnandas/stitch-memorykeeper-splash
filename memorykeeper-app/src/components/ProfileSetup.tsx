import React from 'react';
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';

import { ChevronLeft, Camera, User, Sun, Moon, Contrast, Palette } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';

interface ProfileSetupProps {
  onBack: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onBack }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState(78);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [consentAnalysis, setConsentAnalysis] = useState(false);
  const [consentSummaries, setConsentSummaries] = useState(false);
  const [saving, setSaving] = useState(false);

  const { updateProfile } = useAuth();
  const { addToast } = useError();

  const avatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCeW0K825tSHTOFLVjt4RJuHWeiQUAScsjefQkGG69fd-OCCDkCBJQbJJW84VvOiPWdPfTAmOgUf5fRmAqjeZ8TC8L1jYiEsHG0CXsFlf1fPOdeDWRFXyslF38PLSb6Yiawz4zyghK9PbTQNIrW05k4bE94lpbD-z6C40GdpwCRbTaYXZ8xsUuV9ZcK-LwYmykoP5NvumqtASjGQ-HUyyZD6MV6UlMF1MoN5NLOspJpZJXYVDWRUyW7EiuVFgXt04rTD0EbT2q2Kto',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCeW0K825tSHTOFLVjt4RJuHWeiQUAScsjefQkGG69fd-OCCDkCBJQbJJW84VvOiPWdPfTAmOgUf5fRmAqjeZ8TC8L1jYiEsHG0CXsFlf1fPOdeDWRFXyslF38PLSb6Yiawz4zyghK9PbTQNIrW05k4bE94lpbD-z6C40GdpwCRbTaYXZ8xsUuV9ZcK-LwYmykoP5NvumqtASjGQ-HUyyZD6MV6UlMF1MoN5NLOspJpZJXYVDWRUyW7EiuVFgXt04rTD0EbT2q2Kto',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCeW0K825tSHTOFLVjt4RJuHWeiQUAScsjefQkGG69fd-OCCDkCBJQbJJW84VvOiPWdPfTAmOgUf5fRmAqjeZ8TC8L1jYiEsHG0CXsFlf1fPOdeDWRFXyslF38PLSb6Yiawz4zyghK9PbTQNIrW05k4bE94lpbD-z6C40GdpwCRbTaYXZ8xsUuV9ZcK-LwYmykoP5NvumqtASjGQ-HUyyZD6MV6UlMF1MoN5NLOspJpZJXYVDWRUyW7EiuVFgXt04rTD0EbT2q2Kto',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCeW0K825tSHTOFLVjt4RJuHWeiQUAScsjefQkGG69fd-OCCDkCBJQbJJW84VvOiPWdPfTAmOgUf5fRmAqjeZ8TC8L1jYiEsHG0CXsFlf1fPOdeDWRFXyslF38PLSb6Yiawz4zyghK9PbTQNIrW05k4bE94lpbD-z6C40GdpwCRbTaYXZ8xsUuV9ZcK-LwYmykoP5NvumqtASjGQ-HUyyZD6MV6UlMF1MoN5NLOspJpZJXYVDWRUyW7EiuVFgXt04rTD0EbT2q2Kto'
  ];

  const themes = [
    { name: 'Nostalgic', icon: Palette },
    { name: 'Fun', icon: Sun },
    { name: 'High Contrast', icon: Contrast },
    { name: 'Dark Mode', icon: Moon }
  ];

  const handleNext = async () => {
    if (!fullName.trim()) {
      addToast({
        type: 'error',
        title: 'Name Required',
        message: 'Please enter your full name before continuing.',
        duration: 4000
      });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        age,
        avatar_choice: selectedAvatar !== null ? avatars[selectedAvatar] : undefined,
        theme_preference: selectedTheme || undefined,
        ai_consent_analysis: consentAnalysis,
        ai_consent_summaries: consentSummaries,
        invited_family_emails: inviteEmail.trim() ? [inviteEmail.trim().toLowerCase()] : undefined
      });

      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your preferences have been saved.',
        duration: 4000
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error?.message || 'Unable to save your profile. Please try again.',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-auto min-h-screen w-full flex-col justify-between bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 font-display">
      <div className="flex-grow">
        {/* Header with back button */}
        <header className="flex items-center justify-between p-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <img alt="MemoryKeeper Logo" className="h-8 w-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsfOU4yaRaiQ4E0_JijA4PUs0pRfokl5TZAk52ccVRSE0BnpXPkThVwnKszLvTa3DUkaoZa3UYwVOPff-tPzPXoq-iMn1ET_96TXZ5dDBuyQAly23XTxauMUV5yG6EkERRLNn1rVqvpHPEBpsW1zh59fjdnxJ-b3DIFF9O5bIzpWYW2JU8dKfHrQ8d1uelf1uJR92lNdRm-TqhMH4gfz-EBoXR1mvbg-cdS1kn69sBLe8pn3ykzKJTnovmH3PRuwzUZnkX4YWyre0" />
          <button className="font-bold text-primary">Skip</button>
        </header>
        
        <main className="px-4 pb-8">
          <h1 className="text-2xl font-bold leading-tight tracking-tight mb-6 text-gray-800">Create Your Profile</h1>
          <div className="space-y-8">
            <div>
              <label className="text-sm font-medium text-gray-600" htmlFor="full-name">Full Name</label>
              <input
                className="form-input mt-1 flex w-full resize-none overflow-hidden rounded-xl border-2 border-orange-200 bg-white/80 backdrop-blur-xl p-4 text-base font-normal leading-normal text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:ring-0 shadow-lg"
                id="full-name"
                placeholder="e.g., Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600">Age</label>
                <span className="text-lg font-bold text-gray-800">{age}</span>
              </div>
              <input
                className="mt-2 h-2 w-full appearance-none rounded-full bg-orange-200 accent-orange-500"
                max="100"
                min="65"
                type="range"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Select Your Avatar</h2>
              <div className="mt-3 grid grid-cols-3 gap-4">
                {avatars.map((avatar, index) => (
                  <label key={index} className="relative cursor-pointer">
                    <input
                      className="peer sr-only"
                      name="avatar"
                      type="radio"
                      checked={selectedAvatar === index}
                      onChange={() => setSelectedAvatar(index)}
                    />
                    <img
                      className="h-24 w-24 rounded-xl object-cover ring-4 ring-transparent peer-checked:ring-orange-500 shadow-lg"
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                    />
                  </label>
                ))}
                <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/80 backdrop-blur-xl shadow-lg">
                  <input
                    className="peer sr-only"
                    name="avatar"
                    type="radio"
                    checked={selectedAvatar === 4}
                    onChange={() => setSelectedAvatar(4)}
                  />
                  <Camera className="text-4xl text-orange-500" />
                </label>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Choose Your Theme</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <label key={theme.name} className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-orange-200 bg-white/80 backdrop-blur-xl p-4 text-center font-medium text-gray-800 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-100 has-[:checked]:text-orange-700 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        {theme.name}
                      </div>
                      <input
                        className="sr-only"
                        name="theme"
                        type="radio"
                        checked={selectedTheme === theme.name}
                        onChange={() => setSelectedTheme(theme.name)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600" htmlFor="invite-email">Invite Family (Optional)</label>
              <input
                className="form-input mt-1 flex w-full resize-none overflow-hidden rounded-xl border-2 border-orange-200 bg-white/80 backdrop-blur-xl p-4 text-base font-normal leading-normal text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:ring-0 shadow-lg"
                id="invite-email"
                placeholder="family@email.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">AI Privacy Consent</h2>
              <div className="mt-3 space-y-4">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-sm text-gray-700 mb-3">
                    We use AI to enhance your MemoryKeeper experience. Your privacy is important to us, and we are committed to GDPR compliance.
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc pl-5">
                    <li>We will only process your memories with your explicit consent</li>
                    <li>Your data will never be used for AI training without your permission</li>
                    <li>You can withdraw your consent at any time in your profile settings</li>
                    <li>We provide data export and deletion options upon request</li>
                  </ul>
                </div>
                
                <label className="flex items-start gap-x-3 p-4 bg-white rounded-xl border border-gray-200">
                  <input
                    className="form-checkbox mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-gray-300 bg-transparent text-orange-500 focus:ring-0 focus:ring-offset-0"
                    type="checkbox"
                    checked={consentAnalysis}
                    onChange={(e) => setConsentAnalysis(e.target.checked)}
                  />
                  <div>
                    <p className="text-sm text-gray-700">
                      I consent to AI analysis of my memories for personalized insights and game suggestions.
                    </p>
                    <button 
                      className="text-xs font-bold text-orange-600 mt-1"
                      onClick={() => alert('Learn more about how we use AI to analyze your memories for personalized insights and game suggestions. We never share your personal data with third parties without your explicit consent.')}
                    >
                      Learn More
                    </button>
                  </div>
                </label>
                
                <label className="flex items-start gap-x-3 p-4 bg-white rounded-xl border border-gray-200">
                  <input
                    className="form-checkbox mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-gray-300 bg-transparent text-orange-500 focus:ring-0 focus:ring-offset-0"
                    type="checkbox"
                    checked={consentSummaries}
                    onChange={(e) => setConsentSummaries(e.target.checked)}
                  />
                  <div>
                    <p className="text-sm text-gray-700">
                      I consent to AI-generated summaries of my memories for sharing with family.
                    </p>
                    <button 
                      className="text-xs font-bold text-orange-600 mt-1"
                      onClick={() => alert('Learn more about how we generate shareable summaries of your memories. These summaries are only created when you choose to share and can be deleted at any time.')}
                    >
                      Learn More
                    </button>
                  </div>
                </label>
                
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-2">Your Rights Under GDPR</h3>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                    <li>Right to Access: Request copies of your data</li>
                    <li>Right to Rectification: Correct inaccurate data</li>
                    <li>Right to Erasure: Request deletion of your data</li>
                    <li>Right to Data Portability: Export your data in standard format</li>
                    <li>Right to Object: Opt out of certain data processing</li>
                  </ul>
                  <button 
                    className="text-sm font-bold text-orange-600 mt-2"
                    onClick={() => alert('Contact us at privacy@memorykeeper.app to exercise your GDPR rights. We will respond within 30 days.')}
                  >
                    Contact Privacy Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <footer className="sticky bottom-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4">
        <button
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </footer>
    </div>
  );
};

export default ProfileSetup;
