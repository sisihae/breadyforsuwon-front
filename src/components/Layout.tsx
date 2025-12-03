import { Outlet, NavLink } from "react-router";
import {
  MessageCircle,
  Map,
  Heart,
  BookOpen,
  User,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthContext";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, user, logout, loading } = useAuth();

  const navItems = [
    { path: "/chatbot", icon: MessageCircle, label: "AI Chat" },
    { path: "/map", icon: Map, label: "Map & Search" },
    { path: "/wishlist", icon: Heart, label: "Wishlist" },
    { path: "/visited", icon: BookOpen, label: "Visited" },
    { path: "/mypage", icon: User, label: "My Page" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="text-slate-600 dark:text-slate-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:px-8 md:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 md:h-10 md:w-10">
              <span className="text-lg md:text-xl">🥐</span>
            </div>
            <h1 className="text-amber-700 dark:text-amber-500">
              Bready for Suwon
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <p className="hidden text-slate-600 dark:text-slate-300 lg:block">
              Always be ready with Bready!
            </p>
            {isLoggedIn && user && (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:inline">
                  {user.name}님
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-amber-500"
              />
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-2 md:px-8">
          <div className="flex gap-0 overflow-x-auto md:gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1 border-b-2 px-3 py-3 transition-colors md:gap-2 md:px-6 md:py-4 ${
                    isActive
                      ? "border-amber-500 text-amber-600 dark:text-amber-500"
                      : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm md:text-base">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto h-full max-w-7xl px-4 py-4 md:px-8 md:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
