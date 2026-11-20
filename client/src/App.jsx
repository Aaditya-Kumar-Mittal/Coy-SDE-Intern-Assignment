import { useState } from "react";
import Discover from "./components/Discover.jsx";

const TABS = [
  { id: "home", label: "Home" },
  { id: "discover", label: "Discover" },
];

export default function App() {
  const [tab, setTab] = useState("discover");

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          coy<span className="text-pink">.</span>
        </h1>
      </header>

      <main className="min-h-0 flex-1">
        {tab === "home" ? null : <Discover />}
      </main>

      <nav className="flex gap-3 border-t-2 border-ink bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`flex-1 rounded-full border-2 border-ink py-2 text-base font-bold transition-colors ${
              tab === t.id ? "bg-pink shadow-pop" : "bg-white text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
