import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface px-6">
      <div className="w-full max-w-sm rounded-[10px] border border-border/70 bg-white p-8 text-center shadow-card">
        <p className="font-mono text-4xl font-bold text-brand-200">404</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">
          No such page here.
        </h1>
        <p className="mt-2 text-sm text-sub">
          The link moved or never existed.
        </p>
        <Link
          href="/"
          className="mt-6 block rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
