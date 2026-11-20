import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { api } from '../api.js';
import SwipeCard from './SwipeCard.jsx';
import MatchModal from './MatchModal.jsx';
import Matches from './Matches.jsx';

export default function Discover() {
  const [view, setView] = useState('swipe'); // 'swipe' | 'matches'
  const [feed, setFeed] = useState([]);
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [dir, setDir] = useState('like');
  const [matched, setMatched] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [f, m] = await Promise.all([api.feed(), api.matches()]);
      setFeed(f.profiles);
      setMatches(m.matches);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const swipe = useCallback(
    async (action) => {
      const top = feed[0];
      if (!top || matched) return;

      setDir(action);
      setFeed((f) => f.slice(1)); // remove right away so the card can fly out

      try {
        const res = await api.swipe(top._id, action);
        if (res.match) {
          setMatches((m) => [{ matchedAt: new Date().toISOString(), profile: res.profile }, ...m]);
          setMatched(res.profile);
        }
      } catch {
        setFeed((f) => [top, ...f]); // put the card back if saving failed
        flash("Couldn't save that swipe. Try again.");
      }
    },
    [feed, matched]
  );

  // keyboard support on desktop
  useEffect(() => {
    if (view !== 'swipe') return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') swipe('like');
      if (e.key === 'ArrowLeft') swipe('pass');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [swipe, view]);

  const resetDemo = async () => {
    await api.reset();
    load();
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* segmented switch: Swipe | Matches */}
      <div className="mx-5 mb-3 flex rounded-full border-2 border-ink bg-soft p-1">
        {[
          ['swipe', 'Swipe'],
          ['matches', `Matches${matches.length ? ` (${matches.length})` : ''}`],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 rounded-full py-1.5 text-sm font-bold transition-colors ${
              view === id ? 'bg-ink text-white' : 'text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'matches' ? (
        <Matches matches={matches} onBack={() => setView('swipe')} />
      ) : status === 'loading' ? (
        <p className="m-auto font-semibold text-muted">Loading profiles…</p>
      ) : status === 'error' ? (
        <div className="m-auto flex flex-col items-center gap-3 px-8 text-center">
          <p className="font-semibold">Couldn't load profiles. Check that the server is running.</p>
          <button onClick={load} className="rounded-full border-2 border-ink bg-pink px-6 py-2 font-bold shadow-pop">
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="relative mx-5 min-h-0 flex-1">
            {feed.length === 0 ? (
              <EmptyState onMatches={() => setView('matches')} onReset={resetDemo} />
            ) : (
              <>
                {feed[1] && (
                  <div className="absolute inset-0 scale-[0.94] translate-y-3.5 overflow-hidden rounded-[20px] border-2 border-ink bg-lilac">
                    <img src={feed[1].photo} alt="" className="h-full w-full object-cover opacity-70" />
                  </div>
                )}
                <AnimatePresence custom={dir}>
                  <SwipeCard key={feed[0]._id} profile={feed[0]} onSwipe={swipe} />
                </AnimatePresence>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 py-4">
            <button
              onClick={() => swipe('pass')}
              disabled={!feed.length}
              aria-label="Pass"
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-white text-3xl font-bold shadow-pop transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40"
            >
              ✕
            </button>
            <button
              onClick={() => swipe('like')}
              disabled={!feed.length}
              aria-label="Like"
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-pink text-3xl shadow-pop transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40"
            >
              ♥
            </button>
          </div>
        </>
      )}

      {toast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full border-2 border-ink bg-yellow px-4 py-2 text-sm font-bold shadow-pop">
          {toast}
        </div>
      )}

      {matched && (
        <MatchModal
          profile={matched}
          onKeepSwiping={() => setMatched(null)}
          onViewMatches={() => {
            setMatched(null);
            setView('matches');
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ onMatches, onReset }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-ink bg-soft px-8 text-center">
      <h2 className="text-2xl font-extrabold">You're all caught up</h2>
      <p className="text-muted">There is no one new right now. Check back later or look at your matches.</p>
      <button onClick={onMatches} className="mt-2 rounded-full border-2 border-ink bg-pink px-6 py-2.5 font-bold shadow-pop">
        See matches
      </button>
      {import.meta.env.DEV && (
        <button onClick={onReset} className="text-sm font-bold text-muted underline underline-offset-4">
          Reset demo (dev only)
        </button>
      )}
    </div>
  );
}
