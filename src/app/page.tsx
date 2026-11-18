import Link from "next/link";
import { ThemeToggle } from "../components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* 1. 상단 네비게이션 바 (Navbar) */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            Modu-Kit
            <span className="text-indigo-600 dark:text-indigo-400">.</span>
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <ThemeToggle />

          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            로그인
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            시작하기
          </Link>
        </nav>
      </header>

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* 히어로 섹션 (Hero Section) */}
        <div className="max-w-3xl space-y-6">
          {/* 상단 뱃지 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Next.js Enterprise Starter Kit v0.1
          </div>

          {/* 메인 헤드카피 */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            개발의 번거로움을 줄이고,
            <br />
            <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              핵심 가치에 집중하세요
            </span>
          </h1>

          {/* 서브 설명글 */}
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            인증, 보안, 모던 UI 세팅이 미리 완료되어 있어 다양한 웹 서비스를
            가장 빠르고 안전하게 구축할 수 있습니다.
          </p>

          {/* CTA 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition text-center"
            >
              무료로 시작하기
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto rounded-lg border border-zinc-200 dark:border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-center"
            >
              기능 살펴보기
            </Link>
          </div>
        </div>

        {/* 3. 특징 소개 카드 섹션 (Features Grid) */}
        <div
          id="features"
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left"
        >
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              🔒
            </div>
            <h3 className="font-semibold text-lg">완벽한 보안 인증</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Access Token과 HttpOnly Cookie 기반의 Refresh Token 로직이
              구현되어 있습니다.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              ⚡
            </div>
            <h3 className="font-semibold text-lg">초고속 개발 환경</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              App Router와 Tailwind CSS 기반으로 군더더기 없이 빠르고 확장성
              있게 작동합니다.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              💎
            </div>
            <h3 className="font-semibold text-lg">모던 UI 디자인</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              최신 SaaS 트렌드에 맞춘 세련된 색감과 반응형 레이아웃을 기본
              제공합니다.
            </p>
          </div>
        </div>
      </main>

      {/* 4. 푸터 (Footer) */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 py-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Modu-Kit. All rights reserved.
      </footer>
    </div>
  );
}
