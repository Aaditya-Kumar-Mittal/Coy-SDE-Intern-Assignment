import { motion, useMotionValue, useTransform } from "framer-motion";

const DISTANCE = 110;
const VELOCITY = 600;

const variants = {
  enter: { scale: 0.94, y: 14 },
  center: { scale: 1, y: 0 },
  exit: (dir) => ({
    x: dir === "like" ? 520 : -520,
    opacity: 0,
    transition: { duration: 0.3 },
  }),
};

export default function SwipeCard({ profile, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const likeOpacity = useTransform(x, [20, DISTANCE], [0, 1]);
  const passOpacity = useTransform(x, [-DISTANCE, -20], [1, 0]);

  const handleDragEnd = (_e, info) => {
    if (info.offset.x > DISTANCE || info.velocity.x > VELOCITY) onSwipe("like");
    else if (info.offset.x < -DISTANCE || info.velocity.x < -VELOCITY)
      onSwipe("pass");
  };

  return (
    <motion.article
      style={{ x, rotate }}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden rounded-[20px] border-2 border-ink bg-lilac shadow-pop-lg active:cursor-grabbing"
    >
      <img
        src={profile.photo}
        alt={`${profile.name}`}
        draggable={false}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent" />

      {/* feedback stamps that fade in while dragging */}
      <motion.span
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-5 -rotate-12 rounded-xl border-4 border-ink bg-mint px-3 py-1 text-2xl font-extrabold"
      >
        LIKE
      </motion.span>
      <motion.span
        style={{ opacity: passOpacity }}
        className="absolute top-6 right-5 rotate-12 rounded-xl border-4 border-ink bg-pinksoft px-3 py-1 text-2xl font-extrabold"
      >
        PASS
      </motion.span>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h2 className="text-3xl font-extrabold leading-tight">
          {profile.name}, {profile.age}
        </h2>
        <p className="mt-0.5 text-sm font-semibold text-white/80">
          {profile.city}
        </p>
        <p className="mt-2 text-base leading-snug">{profile.bio}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {profile.interests.map((i) => (
            <li
              key={i}
              className="rounded-full border-2 border-ink bg-yellow px-2.5 py-0.5 text-xs font-bold text-ink"
            >
              {i}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
