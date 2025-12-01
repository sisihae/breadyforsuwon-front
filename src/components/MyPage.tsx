import { useState } from "react";
import { User, Mail, MapPin, Calendar, Settings, LogOut } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function MyPage() {
  const [profile, setProfile] = useState({
    name: "김수원",
    email: "suwon.bread@example.com",
    location: "경기도 수원시 팔달구",
    joinDate: "2024년 10월",
    visitedCount: 12,
    wishlistCount: 5,
  });

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-slate-900">마이페이지</h2>
        <p className="text-slate-600">내 프로필 및 활동 정보</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="mb-6 text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarImage src="" alt={profile.name} />
                <AvatarFallback className="bg-amber-500 text-white text-2xl">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-slate-900">{profile.name}</h3>
              <p className="text-sm text-slate-600">{profile.email}</p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{profile.joinDate} 가입</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-2xl text-amber-600">{profile.visitedCount}</p>
                <p className="text-xs text-slate-600">방문한 빵집</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-2xl text-amber-600">{profile.wishlistCount}</p>
                <p className="text-xs text-slate-600">위시리스트</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Card */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-slate-900">
                <Settings className="h-5 w-5" />
                개인정보 설정
              </h3>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                {isEditing ? "저장" : "수정"}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="location">지역</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <h4 className="text-slate-900">알림 설정</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    defaultChecked
                  />
                  <span className="text-sm text-slate-700">
                    새로운 빵집 추가 알림 받기
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    defaultChecked
                  />
                  <span className="text-sm text-slate-700">
                    위시리스트 빵집 근처 알림
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-slate-700">
                    마케팅 정보 수신
                  </span>
                </label>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <h4 className="text-slate-900">계정 관리</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  비밀번호 변경
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="mb-4 text-slate-900">최근 활동</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-slate-900">빵굽는날</p>
                <p className="text-sm text-slate-600">방문 후기 작성</p>
              </div>
              <span className="text-sm text-slate-500">2024.11.25</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-slate-900">베이커리카페 밀</p>
                <p className="text-sm text-slate-600">위시리스트 추가</p>
              </div>
              <span className="text-sm text-slate-500">2024.11.20</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-slate-900">르뱅드마리</p>
                <p className="text-sm text-slate-600">방문 완료</p>
              </div>
              <span className="text-sm text-slate-500">2024.11.20</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
