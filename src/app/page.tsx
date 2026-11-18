export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Transportbor.uz</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Next.js + MongoDB loyihasi ishga tushdi.
      </p>
      <a
        href="/api/health"
        className="rounded-full bg-black px-5 py-2 text-white dark:bg-white dark:text-black"
      >
        Baza holatini tekshirish
      </a>
    </main>
  );
}
