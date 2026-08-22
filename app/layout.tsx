import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Google Web Font 최적화 (Vercel 공식 Geist 폰트)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO(검색엔진 최적화) 및 글로벌 메타데이터 세팅
export const metadata: Metadata = {
  title: {
    default: "ModuKit | Starter-Kit",
    template: "%s | ModuKit", // ex) "Dashboard | ModuKit" 형태로 표시
  },

  // 제목 아래에 노출되는 대표 설명글
  description:
    "인증, 보안, Admin 환경이 미리 세팅되어 다양한 웹 서비스를 빠르게 개발할 수 있는 Next.js 스타터 키트",

  // 파비콘 및 모바일 OS용 아이콘 설정 (public/*)
  icons: {
    icon: "/favicon.ico", // public/favicon.ico (기본 파비콘 16x16, 32x32 권장)
    apple: "/apple-touch-icon.png", // public/apple-touch-icon.png ('홈 화면에 추가' 기능 실행 시 표시되는 앱 아이콘 180x180 권장)
  },

  // SNS(카카오톡, 트위터, 슬랙 등) 링크 공유 시 노출되는 OpenGraph 카드 설정
  openGraph: {
    title: "ModuKit | Starter-Kit",
    description:
      "인증, 보안, Admin 환경이 미리 세팅되어 다양한 웹 서비스를 빠르게 개발할 수 있는 Next.js 스타터 키트",
    url: "https://your-domain.com", // 실제 서비스 배포 시 해당 도메인 URL로 변경
    siteName: "ModuKit",
    images: [
      {
        url: "/og-image.png", // public/og-image.png (공유 시 노출될 대표 썸네일 이미지, 1200x630 권장)
        width: 1200,
        height: 630,
        alt: "ModuKit Preview",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
