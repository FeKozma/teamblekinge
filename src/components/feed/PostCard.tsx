"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState, type CSSProperties } from "react";
import { IconCheck, IconSend, IconThumb } from "@/components/icons";
import { Avatar, DateBadge } from "@/components/ui";
import { feedKindLabel, type FeedPost } from "@/lib/data/feed";
import { people } from "@/lib/data/users";
import { relativeDay } from "@/lib/format";
import {
  joinersWith,
  listNames,
  nameOf,
  plural,
  timeAgo,
  useCommentLiked,
  useJoined,
  useLiked,
  useMyComments,
  useNow,
  type MyComment,
  type MyPost,
} from "./feed-store";

type Me = { id: string; firstName: string };

export function PostCard({
  post,
  me,
  today,
  onDelete,
}: {
  post: FeedPost | MyPost;
  me: Me;
  today: string;
  onDelete?: () => void;
}) {
  const uid = useId();
  const now = useNow();
  const author = people[post.author];
  const [liked, setLiked] = useLiked(post, me.id);
  const [popped, setPopped] = useState(false);
  const [myComments] = useMyComments(post.id);
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const likes = post.likes + (liked ? 1 : 0) - (post.likedByMe ? 1 : 0);
  const listed = (post.earlierComments?.length ?? 0) + post.comments.length;
  const comments = Math.max(post.commentCount ?? 0, listed) + myComments.length;
  const when = "createdAt" in post ? timeAgo(post.createdAt, now) : post.when;
  const kind = post.kind === "meddelande" ? null : feedKindLabel[post.kind];

  function focusComment(prefill?: string) {
    setComposing(true);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      if (prefill && !el.value.startsWith(prefill)) el.value = prefill + el.value;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  return (
    <article
      id={post.id}
      aria-labelledby={`${uid}-by`}
      className="scroll-mt-24 overflow-hidden rounded-[14px] border border-line bg-white"
    >
      <header className="flex items-center gap-2.5 px-3.5 pt-3.5 md:px-4 md:pt-4">
        <Avatar person={post.author} size={40} />
        <span className="flex min-w-0 flex-1 flex-col leading-[1.3]">
          <span id={`${uid}-by`} className="text-[15px] font-bold md:text-[16px]">
            {author?.name ?? "Medlem"}
            {author?.title && <>, {author.title}</>}
            {post.group && (
              <>
                {" "}
                <span className="font-medium text-muted">i</span> {post.group}
              </>
            )}
          </span>
          <span className="text-[12px] text-muted md:text-[13px]">
            {when}
            {kind && <> · {kind}</>}
            {post.unread && (
              <span className="font-bold text-orange-dark">
                {" "}
                · <span aria-hidden="true" className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-orange align-middle" /> Nytt
              </span>
            )}
          </span>
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="min-h-10 rounded-lg px-2.5 text-[13px] font-semibold text-muted hover:bg-paper hover:text-ink"
          >
            Ta bort<span className="sr-only"> ditt inlägg</span>
          </button>
        )}
      </header>

      {post.title && (
        <p className="mx-3.5 my-2.5 text-[16px] leading-snug font-bold md:mx-4 md:my-3 md:text-[17px]">{post.title}</p>
      )}
      {post.text && !post.highlight && (
        <p className="mx-3.5 my-2.5 text-[15px] whitespace-pre-line md:mx-4 md:my-3 md:text-[16px]">{post.text}</p>
      )}
      {((!post.title && !post.text) || post.highlight) && <div className="h-3" />}

      {post.image && (
        <div className="relative h-[260px] w-full bg-paper md:h-[340px]">
          <Image
            src={post.image.src}
            alt={post.image.alt}
            fill
            sizes="(min-width: 768px) 640px, 100vw"
            className="object-cover"
            unoptimized={post.image.src.startsWith("data:")}
          />
        </div>
      )}

      {post.run && <RunBox post={post} me={me} today={today} />}

      {post.highlight && (
        <div className="stripes-drift mx-3.5 mt-1 rounded-xl bg-orange px-5 py-7 text-center text-[20px] leading-[1.25] font-extrabold text-ink md:mx-4 md:text-[22px]">
          {post.text}
        </div>
      )}
      {post.cta && (
        <div className="px-3.5 pt-3 pb-1 md:px-4">
          <Link href={post.cta.href} className="btn btn-dark">
            {post.cta.label}
          </Link>
        </div>
      )}

      {(likes > 0 || comments > 0) && (
        <div className="flex justify-between px-3.5 py-2 text-[13px] text-muted md:px-4 md:py-2.5 md:text-[14px]">
          <span aria-live="polite">{likes > 0 ? plural(likes, "gillar", "gillar") : ""}</span>
          <span>{comments > 0 ? plural(comments, "kommentar", "kommentarer") : ""}</span>
        </div>
      )}

      <div className="flex gap-1 border-t border-line px-2 py-1 md:px-2.5 md:py-1.5">
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => {
            setLiked(!liked);
            setPopped(!liked);
          }}
          className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-[14px] transition-colors hover:bg-paper md:min-h-10 md:flex-none ${
            liked ? "font-extrabold text-orange-dark" : "font-bold text-muted"
          }`}
        >
          <IconThumb size={16} className={popped && liked ? "like-pop" : ""} />
          {liked ? "Gillad" : "Gilla"}
        </button>
        <button
          type="button"
          onClick={() => focusComment()}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 text-[14px] font-bold text-muted transition-colors hover:bg-paper md:min-h-10 md:flex-none"
        >
          Kommentera
        </button>
      </div>

      <Comments post={post} me={me} composing={composing} inputRef={inputRef} onReply={focusComment} />
    </article>
  );
}

/** The löprunda box: upcoming (orange outline + join toggle) or done (grey). */
function RunBox({ post, me, today }: { post: FeedPost; me: Me; today: string }) {
  const run = post.run!;
  const [joined, setJoined] = useJoined(post, me.id);
  const [stride, setStride] = useState(0);
  const joiners = joinersWith(run.joiners, me.id, joined);
  const done = run.done || run.date < today;
  const isToday = relativeDay(run.date, today) === "I dag";

  if (done) {
    return (
      <div className="mx-3.5 mb-3 flex flex-wrap items-center gap-3 rounded-xl bg-paper p-3 md:mx-4 md:mb-3.5 md:p-3.5">
        <DateBadge date={run.date} size={56} />
        <span className="flex min-w-0 flex-[1_1_200px] flex-col">
          <span className="text-[15px] font-extrabold md:text-[16px]">{run.headline}</span>
          {run.detail && <span className="text-[14px] text-muted">{run.detail}</span>}
        </span>
        <span className="flex-none text-[14px] font-bold text-muted">
          Genomförd · {joiners.length} var med
        </span>
      </div>
    );
  }

  return (
    <div className="mx-3.5 mb-3 flex flex-col gap-3 rounded-xl border-2 border-orange p-3 sm:flex-row sm:flex-wrap sm:items-center md:mx-4 md:mb-3.5 md:p-3.5">
      <div className="flex min-w-0 flex-[1_1_240px] items-center gap-3">
        <span className={`flex-none rounded-lg ${isToday ? "live-dot" : ""}`}>
          <DateBadge date={run.date} today={today} size={56} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] leading-snug font-extrabold md:text-[16px]">{run.headline}</span>
          {run.detail && <span className="text-[13px] text-muted md:text-[14px]">{run.detail}</span>}
          <span className="mt-1.5 flex items-center gap-2">
            <span className="flex flex-none pl-1.5" aria-hidden="true">
              {joiners.slice(0, 6).map((id) => (
                <Avatar
                  key={id}
                  person={id}
                  size={24}
                  className={`-ml-1.5 ring-2 ring-white ${id === me.id ? "hop-in" : ""}`}
                />
              ))}
            </span>
            <span className="text-[13px] text-muted" aria-live="polite">
              {joiners.length === 0 ? (
                "Bli först att hänga med!"
              ) : (
                <>
                  {joiners.length} hänger med<span className="hidden sm:inline">: {listNames(joiners, me.id)}</span>
                </>
              )}
            </span>
          </span>
        </span>
      </div>
      <button
        type="button"
        aria-pressed={joined}
        onClick={() => {
          setJoined(!joined);
          setStride((n) => n + 1);
        }}
        title={joined ? "Tryck igen om du inte kan ändå" : undefined}
        className={`inline-flex min-h-[46px] w-full flex-none items-center justify-center gap-2 rounded-[10px] px-4 text-[15px] font-extrabold transition-[background-color,color,box-shadow,translate] duration-300 hover:-translate-y-0.5 sm:min-h-11 sm:w-auto ${
          joined
            ? "bg-ink text-white hover:shadow-[0_8px_18px_-8px_rgba(34,30,31,0.6)]"
            : "bg-orange text-ink hover:shadow-[0_8px_18px_-6px_rgba(238,137,21,0.7)]"
        }`}
      >
        <span key={stride} className={`inline-flex items-center gap-2 ${stride ? "stride" : ""}`}>
          {joined && <IconCheck size={18} strokeWidth={2.6} className="text-orange" />}
          Jag hänger med
        </span>
      </button>
    </div>
  );
}

function Comments({
  post,
  me,
  composing,
  inputRef,
  onReply,
}: {
  post: FeedPost;
  me: Me;
  composing: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onReply: (prefill: string) => void;
}) {
  const uid = useId();
  const [mine, setMine] = useMyComments(post.id);
  const [showEarlier, setShowEarlier] = useState(false);
  const earlier = post.earlierComments ?? [];
  const visible: MyComment[] = [...(showEarlier ? earlier : []), ...post.comments, ...mine];
  const open = composing || visible.length > 0 || earlier.length > 0;
  if (!open) return null;

  return (
    <div className="flex flex-col gap-2.5 border-t border-line px-3.5 pt-3 pb-3.5 md:px-4 md:pb-4">
      {!showEarlier && earlier.length > 0 && (
        <button
          type="button"
          onClick={() => setShowEarlier(true)}
          className="self-start text-[14px] font-semibold text-orange-dark underline underline-offset-[3px] hover:text-orange-deep"
        >
          Visa {plural(earlier.length, "tidigare kommentar", "tidigare kommentarer")}
        </button>
      )}
      {visible.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {visible.map((c, i) => (
            <CommentItem
              key={c.id}
              comment={c}
              me={me}
              animate={showEarlier && i < earlier.length ? i : "createdAt" in c ? 0 : null}
              onReply={() => onReply(`@${people[c.author]?.firstName ?? "Medlem"} `)}
            />
          ))}
        </ul>
      )}
      <form
        className="flex items-center gap-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          const input = inputRef.current;
          const text = input?.value.trim();
          if (!input || !text) return;
          setMine((m) => [...m, { id: `c-${Date.now().toString(36)}`, author: me.id, when: "", createdAt: Date.now(), text }]);
          input.value = "";
        }}
      >
        <Avatar person={me.id} size={32} />
        <label htmlFor={`${uid}-c`} className="sr-only">
          Skriv en kommentar
        </label>
        <span className="relative flex min-w-0 flex-1">
          <input
            id={`${uid}-c`}
            ref={inputRef}
            type="text"
            autoComplete="off"
            placeholder="Skriv en kommentar…"
            className="peer min-h-10 w-full rounded-full bg-paper py-2 pr-11 pl-3.5 text-[14px] text-ink placeholder:text-muted"
          />
          {/* Appears as soon as there's text (also after "Svara" prefills a name). */}
          <button
            type="submit"
            aria-label="Skicka kommentaren"
            className="absolute top-1/2 right-1 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-orange text-ink transition-[opacity,scale] duration-300 peer-placeholder-shown:pointer-events-none peer-placeholder-shown:scale-50 peer-placeholder-shown:opacity-0"
          >
            <IconSend size={16} />
          </button>
        </span>
      </form>
    </div>
  );
}

function CommentItem({
  comment,
  me,
  animate,
  onReply,
}: {
  comment: MyComment;
  me: Me;
  /** Stagger index when the comment should run in, null to just appear. */
  animate: number | null;
  onReply: () => void;
}) {
  const now = useNow();
  const [liked, setLiked] = useCommentLiked(comment.id, me.id);
  const likes = (comment.likes ?? 0) + (liked ? 1 : 0);
  const when = comment.createdAt ? timeAgo(comment.createdAt, now) : comment.when;
  return (
    <li
      className={`flex gap-2 md:gap-2.5 ${animate !== null ? "slide-in" : ""}`}
      style={animate !== null ? ({ "--i": animate } as CSSProperties) : undefined}
    >
      <Avatar person={comment.author} size={32} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="rounded-xl bg-paper px-3 py-2 text-[14px] md:text-[15px]">
          <strong>{nameOf(comment.author)}</strong> {comment.text}
        </span>
        <span className="flex flex-wrap items-center gap-x-1.5 pl-3 text-[12px] text-muted">
          {when} ·
          <button
            type="button"
            aria-pressed={liked}
            onClick={() => setLiked(!liked)}
            className={`rounded px-0.5 hover:underline ${liked ? "font-bold text-orange-dark" : ""}`}
          >
            {liked ? "Gillad" : "Gilla"}
          </button>
          ·
          <button type="button" onClick={onReply} className="rounded px-0.5 hover:underline">
            Svara
          </button>
          {likes > 0 && (
            <span className="inline-flex items-center gap-1">
              · <IconThumb size={12} /> {likes}
            </span>
          )}
        </span>
      </span>
    </li>
  );
}
