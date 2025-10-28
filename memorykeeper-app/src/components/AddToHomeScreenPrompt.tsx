import React from 'react';

interface AddToHomeScreenPromptProps {
  visible: boolean;
  isIOS: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

const AddToHomeScreenPrompt: React.FC<AddToHomeScreenPromptProps> = ({
  visible,
  isIOS,
  onInstall,
  onDismiss
}) => {
  if (!visible) {
    return null;
  }

  const iosSteps = [
    'Tap the Share icon in Safari',
    'Scroll and choose “Add to Home Screen”',
    'Confirm the MemoryKeeper icon'
  ];

  const androidSteps = [
    'Tap “Install app” when prompted',
    'Confirm from the Chrome banner',
    'Launch MemoryKeeper from your home screen'
  ];

  const steps = isIOS ? iosSteps : androidSteps;

  return (
    <section
      aria-live="polite"
      className="fixed inset-x-0 bottom-6 z-40 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-xl rounded-2xl border border-orange-200 bg-white/95 p-4 shadow-2xl shadow-orange-200/40 backdrop-blur-md dark:border-orange-500/30 dark:bg-[#1b1208]/95">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-orange-100 p-2 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
            <span aria-hidden>⬆️</span>
          </div>
          <div className="flex-1 space-y-2 text-left">
            <p className="font-semibold text-gray-900 dark:text-gray-50">
              Install MemoryKeeper for offline journaling
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isIOS
                ? 'Follow these steps to pin MemoryKeeper to your Home Screen on iOS.'
                : 'Install the PWA for quicker launches, offline capture, and gentle reminders.'}
            </p>
            <ol className="list-inside list-decimal text-sm text-gray-700 dark:text-gray-200">
              {steps.map((step) => (
                <li key={step} className="py-0.5">
                  {step}
                </li>
              ))}
            </ol>
            {!isIOS && (
              <button
                type="button"
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                onClick={onInstall}
              >
                Install MemoryKeeper
              </button>
            )}
            <button
              type="button"
              className="text-xs font-medium text-gray-500 underline decoration-dotted underline-offset-2 hover:text-gray-700 dark:text-gray-300"
              onClick={onDismiss}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddToHomeScreenPrompt;
