import { useState } from "react";
import { Calendar, Settings, LogOut } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "./AuthContext";
import LoginPrompt from "./LoginPrompt";

export default function MyPage() {
  const { isLoggedIn, user, logout } = useAuth();

  if (!isLoggedIn) {
    return <LoginPrompt />;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-slate-900 dark:text-slate-100">마이페이지</h2>
        <p className="text-slate-600 dark:text-slate-400">
          내 프로필 및 활동 정보
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 dark:border-slate-700 dark:bg-slate-800">
          <div className="p-6">
            <div className="mb-6 text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarImage
                  src={user?.profile_image || ""}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="bg-amber-500 text-white text-2xl">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-slate-900 dark:text-slate-100">
                {user?.name || "사용자"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {user?.email || "이메일 없음"}
              </p>
            </div>

            <Separator className="my-4 dark:bg-slate-700" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {user?.created_at
                    ? formatJoinDate(user.created_at)
                    : "정보 없음"}{" "}
                  가입
                </span>
              </div>
            </div>

            <Separator className="my-4 dark:bg-slate-700" />

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <p className="text-2xl text-amber-600 dark:text-amber-500">
                  {user?.visit_records_count || 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  방문한 빵집
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <p className="text-2xl text-amber-600 dark:text-amber-500">
                  {user?.wishlist_count || 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  위시리스트
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Card */}
        <Card className="lg:col-span-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Settings className="h-5 w-5" />
                개인정보 설정
              </h3>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={
                  isEditing
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "dark:border-slate-600 dark:hover:bg-slate-700"
                }
              >
                {isEditing ? "저장" : "수정"}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="dark:text-slate-200">
                  이름
                </Label>
                <Input
                  id="name"
                  value={user?.name || editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={!isEditing}
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:disabled:bg-slate-800"
                />
              </div>

              <div>
                <Label htmlFor="email" className="dark:text-slate-200">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:disabled:bg-slate-800"
                />
              </div>
            </div>

            <Separator className="my-6 dark:bg-slate-700" />

            <div className="space-y-3">
              <h4 className="text-slate-900 dark:text-slate-100">알림 설정</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700"
                    defaultChecked
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    새로운 빵집 추가 알림 받기
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700"
                    defaultChecked
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    위시리스트 빵집 근처 알림
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    마케팅 정보 수신
                  </span>
                </label>
              </div>
            </div>

            <Separator className="my-6 dark:bg-slate-700" />

            <div className="space-y-3">
              <h4 className="text-slate-900 dark:text-slate-100">계정 관리</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={logout}
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-slate-700 dark:hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
