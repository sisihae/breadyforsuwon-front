import { LogIn } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";

export default function LoginPrompt() {
  const { login } = useAuth();

  const handleKakaoLogin = () => {
    // 실제 환경에서는 카카오 OAuth 팝업을 여는 코드
    // window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${YOUR_CLIENT_ID}&redirect_uri=${YOUR_REDIRECT_URI}&response_type=code`;
    
    // 데모용: 카카오 로그인 시뮬레이션
    login("kakao_user@kakao.com", "");
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center dark:border-slate-700 dark:bg-slate-800 md:p-8">
        <div className="mb-4 flex justify-center md:mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 md:h-16 md:w-16">
            <LogIn className="h-6 w-6 text-amber-600 dark:text-amber-500 md:h-8 md:w-8" />
          </div>
        </div>
        <h2 className="mb-2 text-slate-900 dark:text-slate-100">로그인이 필요합니다</h2>
        <p className="mb-4 text-slate-600 dark:text-slate-400 md:mb-6">
          이 기능을 사용하려면 카카오 로그인해주세요.
        </p>
        <Button
          onClick={handleKakaoLogin}
          className="w-full bg-[#FEE500] text-[#000000] hover:bg-[#FDD835] dark:bg-[#FEE500] dark:text-[#000000] dark:hover:bg-[#FDD835]"
        >
          <svg
            className="mr-2 h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.8 6.7-.2.8-.8 3.5-.9 4 0 0 0 .3.2.4.1.1.3.1.5 0 .5-.3 4.2-2.8 4.9-3.3.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
          </svg>
          카카오 로그인
        </Button>
      </Card>
    </div>
  );
}