import { type FC, useMemo } from 'react';
import { cn, ui } from '../lib/designSystem';

interface GameMeta {
  id: string;
  title: string;
  description: string;
  hero: string;
  accent: string;
}

const GAMES: GameMeta[] = [
  {
    id: 'match-up',
    title: 'Memory Match-Up',
    description: 'A quick game to test your visual memory.',
    hero:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxzoWhgM7ixyyrWu7pwprDmNpmLmGsTDyzvuTBs1mXI5MgWgCBRYCOx6irOAIEjneVFn4Eqvy4P7yz8Cr_rv3OkrSIppsEXCXagZFQhDvti_oH1Wb9Wvh9QEa-KjIlLcWr5-quHtHpzw9SFLBuKJmGCp5Apz5uq253UQbouGHBt6FfyTc-LKUgjtF4uaSWobygCBWESpziDPQnZayGU5_Rzv7bRTn7ROf2imKveZZ4OGYx87ZoPP6RCucXPVB2l0LgWrO5fwAVpMIr')",
    accent: 'from-primary/15 via-primary/5 to-surface-muted',
  },
  {
    id: 'story-quiz-quest',
    title: 'Story Quiz Quest',
    description: 'Remember details from a short, happy story.',
    hero:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBX3aLf4x57YXdO1cfLqz_q9ZYDUIIOuS9X6ALZ4ZiBWIhoyCel2QJEoAPrpzRFZrIBTH9mZFP8KxfL0sM8bZ2W9z9-gsz13rakDHFDp6Qz0wzkmujmqQ7xox9wDlfDrN2FyUBQwpCvirhk5uqMtsED3ScZyOJzOwfXgVrA_MQYFSRfnJRPue6vHY_PWfs6s4TJCXhpeYt40cFkJBn1UYokoEnoNAEjMqKZFo4zYDEZwM4YLprJd54vi0J27hZUKtoWW21ZXh0tUTXo')",
    accent: 'from-accent/20 via-primary/10 to-surface-muted',
  },
  {
    id: 'timeline-tango',
    title: 'Timeline Tango',
    description: 'Put historical and personal events in order.',
    hero:
      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYcjp6VsJnUSpSU9-jRq1dSU11YpNmhWXP9T1q3sjTLgKi6a6rgTLna30tgCKj2w9mm8Z60zas5sWBb4AOi5V8Nic_39P1AaBJd1keDddchACO4PAdrEdiHsskNOTUigFRU6U6SUJFwKIhYREWs6ZfLPCZ6NDBfQO6iLccbdwAMv8N1hPA0_dga_RTms72O-btvHkflXo9fwniIkbL84Tg0mzwycrVuME37srtZNK4KP5tH1Z99Yy4pSVhU5V0z1dEy6m3D8muEdJs')",
    accent: 'from-primary-muted/60 via-surface-muted to-surface',
  },
];

const GameSelection: FC<{ onBack: () => void; onGameSelect: (gameId: string) => void }> = ({ onBack, onGameSelect }) => {
  const voiceHint = useMemo(() => "Tap the microphone or say 'Play Match-Up'", []);

  return (
    <div className={cn(ui.shell, 'relative flex w-full flex-col overflow-hidden')}>
      <header className="safe-px sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-surface/80 py-4 backdrop-blur-soft">
        <button onClick={onBack} aria-label="Go back" className={ui.iconButton}>
          <span className="material-symbols-outlined !text-2xl">arrow_back</span>
        </button>
        <div className="flex flex-1 flex-col items-center gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-ink-muted">MemoryKeeper</p>
          <h1 className="text-title-1 font-extrabold">Brain Games</h1>
        </div>
        <div className="size-12" aria-hidden />
      </header>

      <main className={cn(ui.shellInner, 'pb-32 pt-6')}>
        <div className="mk-section">
          <p className="text-sm text-ink-muted">Pick a ritual to keep your memories glowing.</p>
        </div>
        <div className="flex flex-col gap-6">
          {GAMES.map((game) => (
            <article key={game.id} className={cn(ui.card, 'overflow-hidden')}>
              <div
                className={cn('h-44 w-full rounded-2xl bg-gradient-to-br bg-cover bg-center', game.accent)}
                style={{ backgroundImage: game.hero }}
              />
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-ink">{game.title}</h2>
                  <span className={cn(ui.chip, 'text-[10px] tracking-[0.3em] text-primary')}>Focus</span>
                </div>
                <p className="text-base leading-relaxed text-ink-muted">{game.description}</p>
                <button onClick={() => onGameSelect(game.id)} className={cn(ui.primaryButton, 'h-14 w-full text-lg')}>
                  <span className="material-symbols-outlined !text-3xl">play_circle</span>
                  Play Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="safe-px fixed bottom-0 left-0 right-0 border-t border-border/60 bg-surface/90 py-4 backdrop-blur-soft">
        <div className="mk-card flex items-center gap-4 bg-transparent p-0 shadow-none">
          <div className={cn(ui.iconButton, 'size-12 shrink-0 border-none bg-primary/15 text-primary')}>
            <span className="material-symbols-outlined !text-3xl">mic</span>
          </div>
          <p className="flex-1 text-sm font-medium text-ink-muted">{voiceHint}</p>
        </div>
      </footer>
    </div>
  );
};

export default GameSelection;
