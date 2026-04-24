import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "オフライン - Shakai Flix",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--accent)]">
          <WifiOff size={28} />
        </div>
        <h1 className="text-2xl font-bold">オフラインです</h1>
        <p className="text-sm text-[color:var(--muted)]">
          動画本体の再生にはインターネット接続が必要です。 保存済みのノート・クイズ結果はオフラインでも閲覧できます。
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className="rounded bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-black hover:bg-white"
          >
            ホームへ
          </Link>
          <Link
            href="/profile"
            className="rounded bg-[color:var(--surface)] px-4 py-2 text-sm hover:bg-[color:var(--surface-hover)]"
          >
            マイページへ
          </Link>
        </div>
      </div>
    </div>
  );
}
