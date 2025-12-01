import { Outlet, NavLink } from "react-router";
import { MessageCircle, Map, Heart, BookOpen, User } from "lucide-react";

export default function Layout() {
  const navItems = [
    { path: "/chatbot", icon: MessageCircle, label: "챗봇" },
    { path: "/map", icon: Map, label: "지도 및 검색" },
    { path: "/wishlist", icon: Heart, label: "위시리스트" },
    { path: "/visited", icon: BookOpen, label: "방문 기록" },
    { path: "/mypage", icon: User, label: "마이페이지" },
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white px-8 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
              <span className="text-xl">🥐</span>
            </div>
            <h1 className="text-amber-700">Bready for Suwon</h1>
          </div>
          <p className="text-slate-600">Always be ready with Bready!</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 border-b-2 px-6 py-4 transition-colors ${
                    isActive
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="mx-auto h-full max-w-7xl px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}