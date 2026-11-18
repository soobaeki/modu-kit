"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-lg p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      aria-label="테마 전환"
    >
      {/* 라이트 모드일 때 보이고, 다크 모드일 때 숨김 */}
      <span className="block dark:hidden text-base">☀️</span>

      {/* 라이트 모드일 때 숨기고, 다크 모드일 때 보임 */}
      <span className="hidden dark:block text-base">🌙</span>
    </button>
  );
}
