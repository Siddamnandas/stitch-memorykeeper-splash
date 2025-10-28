import { useTranslation } from 'react-i18next';
import { cn, softText, ui } from '../lib/designSystem';

interface HomeDashboardProps {
  onBack: () => void;
  onGameStart: (gameType?: string) => void;
  onScrapbookView: () => void;
  onRecord: () => void;
  onWrite: () => void;
  onUpload: () => void;
}

const HomeDashboard = ({ onBack, onGameStart, onScrapbookView, onRecord, onWrite, onUpload }: HomeDashboardProps) => {
  const { t } = useTranslation();
  const streak = 12;
  const scoreProgress = 75; // percentage for the progress ring

  const handleButtonClick = (action: string) => {
    console.log(`Action: ${action}`);
    // Add navigation or logic here based on action
    switch (action) {
      case 'record':
        // Handle record action
        if (onRecord) onRecord();
        break;
      case 'write':
        // Handle write action
        if (onWrite) onWrite();
        break;
      case 'upload':
        // Handle upload action
        if (onUpload) onUpload();
        break;
      case 'start-ritual':
        // Navigate to games page when starting ritual
        if (onGameStart) onGameStart();
        break;
      case 'story-quiz':
        // Navigate to story quiz game
        if (onGameStart) onGameStart('story-quiz');
        break;
      default:
        console.log('Unknown action');
    }
  };

  return (
    <div className={cn(ui.shell, 'relative w-full overflow-hidden')}>
      <header className="safe-px sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-surface/80 py-4 backdrop-blur-soft rounded-b-2xl">
        <button onClick={onBack} aria-label="Go back" className={ui.iconButton}>
          <span className="material-symbols-outlined !text-2xl">arrow_back</span>
        </button>
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-ink-muted">{t('home.welcome')}</p>
          <h1 className="text-title-1 font-extrabold">Nanda</h1>
        </div>
        <div className="size-12" aria-hidden />
      </header>

      <main className={cn(ui.shellInner, 'pb-32')}>
        <section className={cn(ui.card, 'mk-section')}>
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className={softText}>Tue, 23 Jul</p>
              <p className="text-lg font-bold text-primary">🔥 {streak} day streak</p>
            </div>
            <div className="relative size-20">
              <svg className="size-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(236,149,19,0.15)" strokeWidth="10"></circle>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgb(var(--mk-color-primary))"
                  strokeWidth="10"
                  strokeDasharray={`${283 * (scoreProgress / 100)} 283`}
                  transform="rotate(-90 50 50)"
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined !text-3xl text-primary">bolt</span>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(ui.card, 'mk-section')}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t('home.dailyPrompt')}</p>
          <h2 className="text-2xl font-bold leading-tight text-ink mb-4">What did your kitchen smell like?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => handleButtonClick('record')}
              className={cn(
                ui.secondaryButton,
                'flex h-full flex-1 flex-col gap-3 rounded-2xl bg-surface-muted/60 text-center font-bold shadow-soft'
              )}
            >
              <span className={cn(ui.iconButton, 'size-14 border-none bg-primary/10 text-primary mx-auto')}>
                <span className="material-symbols-outlined !text-2xl">mic</span>
              </span>
              <span className="text-lg">{t('home.voiceInput')}</span>
            </button>
            <button
              onClick={() => handleButtonClick('write')}
              className={cn(
                ui.secondaryButton,
                'flex h-full flex-1 flex-col gap-3 rounded-2xl bg-surface-muted/60 text-center font-bold shadow-soft'
              )}
            >
              <span className={cn(ui.iconButton, 'size-14 border-none bg-primary/10 text-primary mx-auto')}>
                <span className="material-symbols-outlined !text-2xl">edit</span>
              </span>
              <span className="text-lg">{t('home.startJournaling')}</span>
            </button>
            <button
              onClick={() => handleButtonClick('upload')}
              className={cn(
                ui.secondaryButton,
                'flex h-full flex-1 flex-col gap-3 rounded-2xl bg-surface-muted/60 text-center font-bold shadow-soft'
              )}
            >
              <span className={cn(ui.iconButton, 'size-14 border-none bg-primary/10 text-primary mx-auto')}>
                <span className="material-symbols-outlined !text-2xl">image</span>
              </span>
              <span className="text-lg">{t('common.upload')}</span>
            </button>
          </div>
        </section>

        <section className={cn(ui.cardMuted, 'mk-section')}>
          <div className={ui.sectionHeader}>
            <h2 className={ui.sectionTitle}>Today's Suggestion</h2>
            <span className={cn(ui.chip, 'text-[10px] tracking-[0.3em] text-primary')}>Recommended</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(ui.iconButton, 'size-16 border-none bg-primary/10 text-primary')}>
              <span className="material-symbols-outlined !text-3xl">menu_book</span>
            </div>
            <div>
              <h3 className="font-bold leading-tight text-ink text-xl">📖 Story Quiz Quest</h3>
              <p className={softText}>Based on your beach memory</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className={softText}>1-2 min</span>
            <button onClick={() => handleButtonClick('story-quiz')} className={cn(ui.primaryButton, 'h-14 px-8')}>
              <span className="material-symbols-outlined !text-2xl">play_circle</span>
              <span className="text-lg">Play Now</span>
            </button>
          </div>
        </section>

        <section className={cn(ui.card, 'mk-section')}>
          <div className="flex items-center gap-4">
            <img
              alt="Scrapbook thumbnail"
              className="size-20 rounded-2xl object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPyBTdkvP3egsIuRkHomntKMQqcwfF6d_svqFlF3swj1veFhhnxc-EZ-lGsGFP7GtGKxuzJwxmzc8FB-LUyQYQ7BvB1JKVSxhujZb0W8NfTwm1JFRU1h211O_tukyiMLUGG88N100-FZDX3jDzbpdV1bE9JJICAKUhfKcQAsW7EFjvRC7botsIOM5kIaquXDx_v-JScbKnxI-pkkUVIuA0zd8Qqt1UcGCOWbF1TSpEzvBN5itLWLem7_Sy-ZI0Ruc-JHVI_XhUrg"
            />
            <div>
              <p className="font-bold leading-tight text-ink text-xl">{t('home.recentMemories')}</p>
              <p className={softText}>A happy memory captured</p>
            </div>
          </div>
          <button onClick={onScrapbookView} className={cn(ui.secondaryButton, 'h-14 w-full justify-center font-bold mt-4')}>
            <span className="text-lg">{t('common.view')}</span>
          </button>
        </section>

        <section className="pt-2">
          <button
            onClick={() => handleButtonClick('start-ritual')}
            className={cn(ui.primaryButton, 'h-16 w-full text-2xl')}
          >
            <span className="material-symbols-outlined !text-3xl">play_circle</span>
            {t('games.title')}
          </button>
        </section>
      </main>
    </div>
  );
};

export default HomeDashboard;
