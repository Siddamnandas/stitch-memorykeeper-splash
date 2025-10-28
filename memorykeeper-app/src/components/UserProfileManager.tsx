import type { FC } from 'react';
import { useTheme } from '../lib/ThemeContext';

interface UserProfileManagerProps {
  onBack: () => void;
}

const UserProfileManager: FC<UserProfileManagerProps> = ({ onBack: _onBack }) => {
  const { isDarkMode, setDarkMode } = useTheme();

  return (
    <div className="flex flex-col min-h-screen justify-between bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-100">
      <div className="flex-grow">
        <header className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark">
          <div></div>
          <h1 className="text-xl font-bold">Your Journey</h1>
          <button className="text-primary font-bold text-sm">Edit Profile</button>
        </header>
        <main className="px-4 space-y-6">
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400">Memory Strength</p>
                <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">85%</p>
                <div className="flex items-center text-sm">
                  <p className="text-zinc-500 dark:text-zinc-400">Last 30 Days</p>
                  <p className="text-green-600 ml-2 font-medium">+5%</p>
                </div>
              </div>
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="stroke-primary/20" cx="50" cy="50" fill="none" r="45" strokeWidth="10"></circle>
                  <circle
                    className="stroke-primary"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="45"
                    strokeDasharray="283"
                    strokeDashoffset="42.45"
                    strokeLinecap="round"
                    strokeWidth="10"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary">local_florist</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-primary/10 dark:bg-primary/20 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/20 rounded-full">
                <span className="material-symbols-outlined text-primary">local_fire_department</span>
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">Daily Streak</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">23 days</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary">workspace_premium</span>
          </div>
          <div>
            <h2 className="text-lg font-bold px-4 py-2">Settings</h2>
            <div className="bg-background-light dark:bg-zinc-900/50 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-700">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Voice Speed</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Adjust playback speed</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">1.0x</span>
                  <input
                    className="w-24 h-2 bg-primary/30 rounded-full appearance-none cursor-pointer accent-primary"
                    max="2"
                    min="0.5"
                    step="0.25"
                    type="range"
                    defaultValue={1}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Dark Mode</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    className="sr-only peer"
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={(event) => setDarkMode(event.target.checked)}
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              <a className="flex items-center justify-between p-4 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors" href="#">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Privacy Settings</p>
                <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500">arrow_forward_ios</span>
              </a>
              <a className="flex items-center justify-between p-4 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors" href="#">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Export Data</p>
                <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500">arrow_forward_ios</span>
              </a>
            </div>
          </div>
          <div className="bg-primary/20 dark:bg-primary/30 rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-lg text-zinc-900 dark:text-white">Upgrade to Premium</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-200 mb-3">Unlock unlimited memories and more.</p>
              <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md hover:opacity-90 transition-opacity">Upgrade Now</button>
            </div>
            <div
              className="w-24 h-24 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARBNU3I0Pg4rQkDxQCuWjZEH_w7hxfUZpQrBYVT3b7KrZBnaitmmVsSEsto_-cQQFywlGXOSwel7LvuTJVdL5rvXhzt5QcdShmclHrazVMNAknF8YKU439n4bXJ5pidu-GzXqPuPOOoAxTroH77yiSgRyHOuuLTIxmNbZYTWk4Se3fhOqT5khtwe_DmQRWpW3XusE76wUe_hRDyFYmAxE53s3fiVoe7m2USfDRDZEv1BCJYR_AmFeYptSUVVNxVtcRxbU6wSRdZi8')",
              }}
            ></div>
          </div>
        </main>
      </div>
      <footer className="sticky bottom-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800">
        <nav className="flex justify-around items-center h-16">
          <a className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400" href="#">
            <span className="material-symbols-outlined">home</span>
            <span className="text-xs font-medium">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400" href="#">
            <span className="material-symbols-outlined">extension</span>
            <span className="text-xs font-medium">Games</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400" href="#">
            <span className="material-symbols-outlined">photo_library</span>
            <span className="text-xs font-medium">Scrapbook</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-primary" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="text-xs font-bold">Profile</span>
          </a>
        </nav>
        <div className="h-safe-area-bottom bg-background-light dark:bg-background-dark"></div>
      </footer>
    </div>
  );
};

export default UserProfileManager;
