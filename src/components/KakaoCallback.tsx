import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

export default function KakaoCallback() {
  const navigate = useNavigate();
  const { fetchCurrentUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The backend has already processed the OAuth callback and set the session cookie
        // We just need to fetch the current user and redirect
        await fetchCurrentUser();
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Failed to complete login:", err);
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    };

    handleCallback();
  }, [fetchCurrentUser, navigate]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="text-slate-600 dark:text-slate-400">로그인 중...</p>
      </div>
    </div>
  );
}
