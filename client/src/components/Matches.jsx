export default function Matches({ matches, onBack }) {
  if (matches.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-ink bg-lilac text-3xl shadow-pop">♥</div>
        <h2 className="text-2xl font-extrabold">No matches yet</h2>
        <p className="text-muted">A match shows up here when you and someone else add each other.</p>
        <button onClick={onBack} className="mt-2 rounded-full border-2 border-ink bg-pink px-6 py-2.5 font-bold shadow-pop">
          Back to swiping
        </button>
      </div>
    );
  }

  return (
    <ul className="grid h-full grid-cols-2 content-start gap-4 overflow-y-auto px-5 pt-2 pb-6">
      {matches.map(({ profile }) => (
        <li key={profile._id} className="overflow-hidden rounded-[20px] border-2 border-ink bg-white shadow-pop">
          <img src={profile.photo} alt={profile.name} className="aspect-[3/4] w-full object-cover" />
          <div className="p-3">
            <p className="font-extrabold leading-tight">{profile.name}, {profile.age}</p>
            <p className="truncate text-xs text-muted">{profile.city}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
