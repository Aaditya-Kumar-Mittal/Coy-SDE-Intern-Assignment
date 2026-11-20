import { motion } from 'framer-motion';

export default function MatchModal({ profile, onKeepSwiping, onViewMatches }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="It's a match"
    >
      <motion.div
        initial={{ scale: 0.7, rotate: -4 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="w-full max-w-sm rounded-[20px] border-2 border-ink bg-white p-6 text-center shadow-pop-lg"
      >
        <div className="relative mx-auto flex h-28 items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-ink bg-peach text-4xl font-extrabold text-muted">
            Y
          </div>
          <div className="z-10 -mx-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-pink text-lg">
            ♥
          </div>
          <img
            src={profile.photo}
            alt={profile.name}
            className="h-24 w-24 rounded-full border-2 border-ink object-cover"
          />
        </div>

        <h2 className="mt-4 text-3xl font-extrabold">It's a match!</h2>
        <p className="mt-1 text-muted">You and {profile.name} added each other.</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onViewMatches}
            className="rounded-full border-2 border-ink bg-pink py-3 text-base font-bold shadow-pop active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            View matches
          </button>
          <button onClick={onKeepSwiping} className="text-sm font-bold text-muted underline underline-offset-4">
            Keep swiping
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
