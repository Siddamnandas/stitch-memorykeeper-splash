import { useState, useMemo, type FC } from 'react';

import { ChevronLeft, Zap, Calendar, Trophy, Users } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useAppState } from '../lib/AppStateContext';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';

interface ViewProgressAndSettingsProps {
  onBack: () => void;
}

const ViewProgressAndSettings: FC<ViewProgressAndSettingsProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const { state, dispatch } = useAppState();
  const { profile } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();

  const stats = useMemo(
    () => [
      { label: 'Memories Recorded', value: String(state.memories.length), icon: Trophy },
      { label: 'Day Streak', value: String(state.streakCount), icon: Calendar },
      { label: 'Memory Strength', value: `${Math.round(state.memoryStrength)}%`, icon: Zap },
      {
        label: 'Family Connections',
        value: String(profile?.invited_family_emails?.length ?? 0),
        icon: Users
      }
    ],
    [profile?.invited_family_emails?.length, state.memories.length, state.memoryStrength, state.streakCount]
  );

  const handleSaveSettings = () => {
    // In a real app, you would save these settings to a database or local storage
    console.log('Settings saved:', { notifications, darkMode: isDarkMode, reminders });
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 font-display">
      <main className="flex-grow p-4">
        <header className="flex items-center mb-6">
          <button
            className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
            onClick={onBack}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-center flex-1 pr-10 text-gray-800">Progress & Settings</h1>
        </header>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Your Progress</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-2xl text-center shadow-lg border border-orange-100">
                  <div className="flex justify-center mb-2">
                    <Icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-4 mb-6 shadow-lg border border-orange-200">
            <h3 className="text-sm font-semibold text-orange-700 mb-3 uppercase tracking-wide">Recently Added Memories</h3>
            {state.memories.length === 0 ? (
              <p className="text-gray-600 text-sm">Capture your first memory to see progress updates.</p>
            ) : (
              <ul className="space-y-3">
                {state.memories.slice(0, 3).map((memory) => (
                  <li key={memory.id} className="bg-white/70 rounded-xl p-3 border border-orange-100">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{memory.response}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{new Date(memory.date).toLocaleDateString()}</span>
                      <span>{memory.type === 'visual' ? 'Visual Memory' : 'Journal Entry'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'premium-features' })}
          className="w-full mt-4 bg-[#4DB6AC] text-white font-bold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Upgrade to Premium
        </button>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-800">Enable Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r from-orange-500 to-rose-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-800">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isDarkMode}
                  onChange={() => setDarkMode(!isDarkMode)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r from-orange-500 to-rose-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-800">Daily Reminders</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={reminders}
                  onChange={() => setReminders(!reminders)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r from-orange-500 to-rose-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <LanguageSelector />
            </div>
          </div>
          
          <button 
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            onClick={handleSaveSettings}
          >
            Save Settings
          </button>
        </div>
      </main>
    </div>
  );
};

export default ViewProgressAndSettings;
