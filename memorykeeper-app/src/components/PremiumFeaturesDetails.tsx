import { type FC } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gamepad2,
  Layers,
  Bot,
  Sparkles,
  Users
} from 'lucide-react';

interface PremiumFeaturesDetailsProps {
  onBack: () => void;
}

const PremiumFeaturesDetails: FC<PremiumFeaturesDetailsProps> = ({ onBack }) => {
  const perks = [
    {
      icon: Gamepad2,
      label: 'Exclusive Games',
      description: 'Unlock story-driven games that keep your mind active.'
    },
    {
      icon: Users,
      label: 'Enhanced Sharing',
      description: 'Invite family, share instantly, and collaborate in real-time.'
    },
    {
      icon: Bot,
      label: 'Advanced AI Assistance',
      description:
        'Priority access to smarter prompts, summaries, and insights tailored to you.'
    },
    {
      icon: Sparkles,
      label: 'Ad-Free Experience',
      description: 'Stay focused with a serene, distraction-free environment.'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f6] font-display text-[#221810] dark:bg-[#221810] dark:text-white">
      <header className="flex items-center px-4 py-4">
        <button
          onClick={onBack}
          className="rounded-full p-2 text-[#221810] transition hover:bg-[#f1ece7] dark:text-white dark:hover:bg-[#2f241b]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 pr-10 text-center text-xl font-bold">
          Premium Features
        </h1>
      </header>

      <main className="flex-1 px-4 pb-4">
        <div
          className="mb-6 h-48 w-full rounded-xl bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYWwEJnuw57qIHo6y-8-CaMFKEHc3hHtVyB-q2xIV9abMnaT0a3NsLVc264rFYYWhHHbKdJPlPZwE8MvtDgAMVsr_allTjVnsJwrJPaMKqXNWpy1DQuJQG4UeuEL9-eo9O2mIFQylyOCip3bAv-eOKL6UJ5JmUPp1rjsMv2ANCzqqwU0-_f8l0tsGD36aNLs4zKxvGR1owIXJ90gwR7hMCSYPmu_fBYvhGv-QymMGtAg83k66cYAGANdIaEbZjHrpxoQgAlSn12z0")'
          }}
          role="img"
          aria-label="Vibrant flower bloom symbolizing growth"
        />

        <section className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Unlock Premium Features</h2>
          <p className="mt-2 text-sm text-[#584a3d] dark:text-[#bda893]">
            Upgrade to enjoy exclusive benefits and enrich your daily ritual.
          </p>
        </section>

        <section className="mb-8 space-y-4">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.label}
                className="flex items-center gap-4 rounded-xl border border-[#e4dcd3] bg-white p-4 shadow-sm dark:border-[#2f241b] dark:bg-[#2a1f17]"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#ee862b]/15 text-[#ee862b]">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold">{perk.label}</p>
                  <p className="text-sm text-[#6e5b4a] dark:text-[#cbb59f]">
                    {perk.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-3">
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#e4dcd3] p-4 shadow-sm transition hover:border-[#ee862b] has-[:checked]:border-[#ee862b] has-[:checked]:bg-[#ee862b]/10 dark:border-[#2f241b] dark:bg-[#2a1f17] dark:hover:border-[#ee862b]">
            <div className="flex-1">
              <p className="font-semibold">Monthly</p>
              <p className="text-sm text-[#6e5b4a] dark:text-[#cbb59f]">
                $9.99 / month
              </p>
            </div>
            <input
              type="radio"
              name="premium-plan"
              defaultChecked
              className="h-5 w-5 border-[#a48a75] text-[#ee862b] focus:ring-transparent"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#e4dcd3] p-4 shadow-sm transition hover:border-[#ee862b] has-[:checked]:border-[#ee862b] has-[:checked]:bg-[#ee862b]/10 dark:border-[#2f241b] dark:bg-[#2a1f17] dark:hover:border-[#ee862b]">
            <div className="flex-1">
              <p className="font-semibold">Annual</p>
              <p className="text-sm text-[#6e5b4a] dark:text-[#cbb59f]">
                $99.99 / year
              </p>
            </div>
            <input
              type="radio"
              name="premium-plan"
              className="h-5 w-5 border-[#a48a75] text-[#ee862b] focus:ring-transparent"
            />
          </label>
        </section>
      </main>

      <footer className="sticky bottom-0 border-t border-[#e4dcd3] bg-[#f8f7f6] px-4 pb-6 pt-5 dark:border-[#2f241b] dark:bg-[#221810]">
        <button
          type="button"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#ee862b] text-lg font-bold text-white shadow-lg transition hover:bg-[#d77521]"
        >
          Upgrade Now
          <ArrowRight className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="mt-3 flex h-14 w-full items-center justify-center rounded-xl border border-[#ee862b] text-lg font-bold text-[#ee862b] transition hover:bg-[#ee862b]/10"
        >
          Start 14-Day Free Trial
        </button>
        <p className="mt-2 text-center text-xs text-[#6e5b4a] dark:text-[#cbb59f]">
          Cancel anytime. Billed after trial ends.
        </p>
      </footer>
    </div>
  );
};

export default PremiumFeaturesDetails;
