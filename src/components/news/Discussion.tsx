"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { IconClose, IconSend } from "@/components/icons";
import { Avatar } from "@/components/ui";
import type { NewsComment } from "@/lib/data/news";
import { people } from "@/lib/data/users";
import { useDemoState } from "@/lib/demo-store";
import { commentTime, storeKeys, useMyComments, type MyComment } from "./store";

// Comments under a news item, with one level of replies and a composer that
// sticks to the bottom of the screen on phones (above the tab bar), as in the
// drawup. DEMO: the visitor's comments and likes live in useDemoState.

type Thread = {
  id: string;
  author: string;
  when: string;
  text: string;
  likes: number;
  mine?: boolean;
  replies: Thread[];
};

/** "@Cecilia Toppen!" → the mention in orange. */
function WithMention({ text }: { text: string }) {
  const m = text.match(/^(@\S+)\s+([\s\S]*)$/);
  if (!m) return <>{text}</>;
  return (
    <>
      <span className="font-bold text-orange-dark">{m[1]}</span> {m[2]}
    </>
  );
}

export function Discussion({
  slug,
  comments,
  me,
}: {
  slug: string;
  comments: NewsComment[];
  me: { id: string; firstName: string };
}) {
  const [mine, setMine] = useMyComments(slug);
  const [liked, setLiked] = useDemoState<string[]>(storeKeys.commentLikes(slug, me.id), []);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (fresh) document.getElementById(`kommentar-${fresh}`)?.scrollIntoView({ block: "center" });
  }, [fresh]);

  const own = (c: MyComment): Thread => ({
    id: c.id,
    author: me.id,
    when: commentTime(c.at),
    text: c.text,
    likes: 0,
    mine: true,
    replies: [],
  });
  const myReplies = (id: string) => mine.filter((c) => c.parentId === id).map(own);
  const threads: Thread[] = [
    ...comments.map((c) => ({
      id: c.id,
      author: c.author,
      when: c.when,
      text: c.text,
      likes: c.likes ?? 0,
      replies: [
        ...(c.replies ?? []).map((r) => ({ ...r, likes: r.likes ?? 0, replies: [] })),
        ...myReplies(c.id),
      ],
    })),
    ...mine.filter((c) => !c.parentId).map((c) => ({ ...own(c), replies: myReplies(c.id) })),
  ];
  const total = threads.reduce((s, t) => s + 1 + t.replies.length, 0);

  const reply = (threadId: string, author: string) => {
    const name = people[author]?.firstName ?? "";
    setReplyTo({ id: threadId, name });
    setText((t) => (t.trim() ? t : `@${name} `));
    inputRef.current?.focus();
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body) return;
    const c: MyComment = { id: `me-${Date.now()}`, text: body, at: Date.now(), parentId: replyTo?.id };
    setMine((prev) => [...prev, c]);
    setText("");
    setReplyTo(null);
    setFresh(c.id);
    setStatus(replyTo ? "Ditt svar är sparat." : "Din kommentar är sparad.");
  };

  const remove = (id: string) => {
    setMine((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    setStatus("Kommentaren är borttagen.");
  };

  const toggleLike = (id: string) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const card = (t: Thread, threadId: string, nested: boolean, children?: ReactNode) => {
    const p = people[t.author];
    const isLiked = liked.includes(t.id);
    const likes = t.likes + (isLiked ? 1 : 0);
    const name = p?.name ?? "Medlem";
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <Avatar person={t.author} size={nested ? 26 : 32} />
          <span className="text-[14px] font-bold">{name}</span>
          {p?.title && !nested && <span className="hidden text-[13px] text-muted sm:inline">{p.title}</span>}
          <span className="text-[13px] text-muted">{t.when}</span>
        </div>
        <p className="m-0 text-[15px] whitespace-pre-line">
          <WithMention text={t.text} />
        </p>
        <div className="flex flex-wrap gap-4 text-[13px] font-bold text-muted">
          <button
            type="button"
            aria-pressed={isLiked}
            onClick={() => toggleLike(t.id)}
            className="min-h-8 hover:text-ink aria-pressed:text-orange-dark"
          >
            Gilla<span className="sr-only"> {name}s kommentar</span>
            {likes > 0 && ` · ${likes}`}
          </button>
          <button type="button" onClick={() => reply(threadId, t.author)} className="min-h-8 hover:text-ink">
            Svara<span className="sr-only"> {name}</span>
          </button>
          {t.mine && (
            <button type="button" onClick={() => remove(t.id)} className="min-h-8 hover:text-ink">
              Ta bort
            </button>
          )}
        </div>
        {children}
      </div>
    );
  };

  return (
    <>
      <section
        id="kommentarer"
        aria-labelledby={headingId}
        className="flex scroll-mt-6 flex-col gap-3 pt-5 md:pt-8"
      >
        <h2 id={headingId} className="m-0 text-[17px] font-extrabold md:text-[22px]">
          Kommentarer ({total})
        </h2>
        {threads.length === 0 && <p className="m-0 text-[15px] text-muted">Inga kommentarer än – skriv den första!</p>}
        {threads.map((t, i) => (
          <article
            key={t.id}
            id={`kommentar-${t.id}`}
            data-reveal="up"
            style={{ "--reveal-i": Math.min(i, 3) } as CSSProperties}
            className={`scroll-mt-6 rounded-xl border border-line bg-white p-3.5 md:p-4 ${fresh === t.id ? "nw-fresh" : ""}`}
          >
            {card(
              t,
              t.id,
              false,
              t.replies.length > 0 && (
                <div className="mt-1 ml-3.5 flex flex-col gap-3 border-l-2 border-line pl-3">
                  {t.replies.map((r) => (
                    <div
                      key={r.id}
                      id={`kommentar-${r.id}`}
                      className={`scroll-mt-6 rounded-lg ${fresh === r.id ? "nw-fresh" : ""}`}
                    >
                      {card(r, t.id, true)}
                    </div>
                  ))}
                </div>
              ),
            )}
          </article>
        ))}
      </section>

      {/* Sticky composer. Phones: above the fixed tab bar (h-16 + safe area). */}
      <form
        onSubmit={submit}
        className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 -mx-4 mt-4 flex flex-col gap-2 border-t border-line bg-white px-4 pt-3 pb-4 shadow-[0_-8px_20px_-14px_rgb(34_30_31/0.35)] md:static md:mx-0 md:rounded-xl md:border md:p-4 md:shadow-none"
      >
        {replyTo && (
          <div className="nw-unfold flex items-center gap-2 text-[13px]">
            <span>
              Svarar <strong>{replyTo.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setReplyTo(null);
                setText((t) => t.replace(/^@\S+\s*/, ""));
              }}
              aria-label="Avbryt svaret"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-paper hover:bg-line"
            >
              <IconClose size={14} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2.5">
          <label className="flex min-w-0 flex-1 flex-col">
            <span className="sr-only">{replyTo ? `Svara ${replyTo.name}` : "Skriv en kommentar"}</span>
            <textarea
              ref={inputRef}
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
              }}
              placeholder="Skriv en kommentar…"
              className="resize-none rounded-[10px] border-[1.5px] border-[#cfc8c4] bg-white px-3 py-2.5 text-[15px] text-ink"
            />
          </label>
          <button
            type="submit"
            disabled={!text.trim()}
            className="btn btn-primary min-h-12 flex-none px-4 font-extrabold disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Skicka
            <IconSend size={16} className="hidden md:block" />
          </button>
        </div>
        <p className="m-0 hidden text-[12px] text-muted md:block">
          Demo: din kommentar sparas bara i den här webbläsaren. Ctrl/⌘ + Enter skickar.
        </p>
        <p role="status" className="sr-only">
          {status}
        </p>
      </form>
    </>
  );
}
