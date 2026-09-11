"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-surface px-6">
        <div className="w-full max-w-sm rounded-[10px] border border-border/70 bg-white p-8 text-center shadow-card">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ember">
            Something broke
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">
            This page hit a snag.
          </h1>
          <p className="mt-2 text-sm text-sub">
            Try again — your work is saved.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Try again
            </button>
            <Link
              href="/"
              className="flex-1 rounded-md border border-border px-4 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
