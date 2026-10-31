"use client";

import { useState } from "react";
import { IconBell, IconThumb } from "@/components/icons";
import { useDemoState } from "@/lib/demo-store";
import { storeKeys } from "./store";

/** "Gilla · 12" and "Följ / Följer" under a news item. */
export function Reactions({
  slug,
  likes,
  followedByMe,
  me,
}: {
  slug: string;
  likes: number;
  followedByMe: boolean;
  me: string;
}) {
  const [liked, setLiked] = useDemoState<boolean>(storeKeys.like(slug, me), false);
  const [following, setFollowing] = useDemoState<boolean>(storeKeys.follow(slug, me), followedByMe);
  const [bump, setBump] = useState(0);
  const [touched, setTouched] = useState(false);

  const pill =
    "inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[14px] font-bold transition-[background-color,border-color,color,translate] duration-300 hover:-translate-y-0.5";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        aria-pressed={liked}
        onClick={() => {
          if (!liked) setBump((b) => b + 1);
          setLiked(!liked);
        }}
        className={`${pill} ${
          liked ? "border-orange bg-orange-soft text-ink" : "border-[#cfc8c4] bg-white text-ink hover:border-ink"
        }`}
      >
        <IconThumb
          key={bump}
          size={18}
          className={`${bump ? "nw-thumb" : ""} ${liked ? "text-orange-dark" : ""}`}
          fill={liked ? "currentColor" : "none"}
          fillOpacity={0.25}
        />
        Gilla · {likes + (liked ? 1 : 0)}
      </button>
      <button
        type="button"
        aria-pressed={following}
        onClick={() => {
          setFollowing(!following);
          setTouched(true);
        }}
        className={`${pill} ${
          following ? "border-ink bg-ink text-white" : "border-[#cfc8c4] bg-white text-ink hover:border-ink"
        }`}
      >
        <IconBell
          size={18}
          className={following ? "text-orange" : ""}
          fill={following ? "currentColor" : "none"}
        />
        {following ? "Följer" : "Följ"}
      </button>
      <p role="status" className="m-0 text-[13px] text-muted">
        {touched &&
          (following ? "Du får en avisering när någon kommenterar." : "Du får inte längre aviseringar om tråden.")}
      </p>
    </div>
  );
}
