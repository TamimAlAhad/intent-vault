"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md space-y-4 rounded-[28px] border border-border bg-white/90 p-8 text-center shadow-sm">
        <h2 className="font-serif text-3xl text-foreground">Something went sideways</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="rounded-full bg-orange-500 px-5 py-2 text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}