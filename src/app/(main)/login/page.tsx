"use client";

export default function page() {
  //   const router = useRouter();
  //   const [username, setUsername] = useState("");
  //   const [password, setPassword] = useState("");
  //   const [error, setError] = useState("");
  //   const [loading, setLoading] = useState(false);

  //   const handleLogin = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setError("");
  //     setLoading(true);
  //   };

  return (
    // 최상단 컨테이너: 모바일은 세로(col), 데스크톱(lg)은 가로(row) 분할
    <div className="flex flex-col lg:flex-row flex-1 w-full">
      {/* 1. [좌측 영역] 브랜드 & 비주얼 섹션 (모바일에서는 숨기고, 데스크톱에서만 보임) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-900"></div>
    </div>
  );
}
