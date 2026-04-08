import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Tasks', href: '#' },
    { name: 'Streaks', href: '#' },
    { name: 'Notes', href: '#' },
    { name: 'Profile', href: '#' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-border bg-card px-6 py-3">
            <div className="flex items-center justify-between">
              <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-[family-name:var(--font-display)] text-xl text-foreground">
                  DevTrack
                </span>
                <span className="text-foreground/60">•</span>
              </motion.div>

              <div className="hidden items-center gap-8 md:flex">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -2 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>

              <motion.button
                onClick={onEnterApp}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Open App
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
