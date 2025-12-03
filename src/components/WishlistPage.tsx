import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Trash2, Calendar, Edit2, Check, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuth } from "./AuthContext";
import LoginPrompt from "./LoginPrompt";
import { wishlistAPI, WishlistItem as APIWishlistItem } from "../utils/api-service";

interface WishlistItemDisplay {
  id: string;
  bakeryName: string;
  address: string;
  specialty: string;
  addedDate: Date;
  notes: string;
  visited: boolean;
}

export default function WishlistPage() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <LoginPrompt />;
  }
  const [filter, setFilter] = useState<"all" | "visited" | "unvisited">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedNote, setEditedNote] = useState<string>("");
  const [wishlist, setWishlist] = useState<WishlistItemDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const items = await wishlistAPI.getAll();
      const displayItems: WishlistItemDisplay[] = items.map((item) => ({
        id: item.id,
        bakeryName: item.bakery_name,
        address: item.bakery_address,
        specialty: item.bread_types.join(", "),
        addedDate: new Date(item.created_at),
        notes: item.note || "",
        visited: item.visited,
      }));
      setWishlist(displayItems);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await wishlistAPI.delete(id);
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete wishlist item:", error);
      alert("위시리스트 삭제에 실패했습니다.");
    }
  };

  const toggleVisited = async (id: string) => {
    const item = wishlist.find((i) => i.id === id);
    if (!item) return;

    try {
      await wishlistAPI.update(id, { visited: !item.visited });
      setWishlist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, visited: !item.visited } : item
        )
      );
    } catch (error) {
      console.error("Failed to update wishlist item:", error);
      alert("방문 상태 업데이트에 실패했습니다.");
    }
  };

  const startEditing = (id: string, currentNote: string) => {
    setEditingId(id);
    setEditedNote(currentNote);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedNote("");
  };

  const saveNote = async (id: string) => {
    try {
      await wishlistAPI.update(id, { note: editedNote });
      setWishlist((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, notes: editedNote } : item
        )
      );
      setEditingId(null);
      setEditedNote("");
    } catch (error) {
      console.error("Failed to update note:", error);
      alert("메모 저장에 실패했습니다.");
    }
  };

  const filteredWishlist = wishlist.filter((item) => {
    if (filter === "visited") return item.visited;
    if (filter === "unvisited") return !item.visited;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100">위시리스트</h2>
          <p className="text-slate-600 dark:text-slate-400">
            방문하고 싶은 빵집 {wishlist.length}곳
          </p>
        </div>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px] dark:border-slate-600 dark:bg-slate-800">
            <SelectValue placeholder="필터 선택" />
          </SelectTrigger>
          <SelectContent className="dark:border-slate-600 dark:bg-slate-800">
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="unvisited">미방문</SelectItem>
            <SelectItem value="visited">방문 완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredWishlist.length === 0 ? (
        <Card className="flex flex-1 flex-col items-center justify-center p-12 dark:border-slate-700 dark:bg-slate-800">
          <Heart className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
          <h3 className="text-slate-900 dark:text-slate-100">
            {filter === "all" ? "위시리스트가 비어있습니다" : "해당하는 항목이 없습니다"}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {filter === "all" ? "지도에서 마음에 드는 빵집을 추가해보세요" : "다른 필터를 선택해보세요"}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWishlist.map((item) => (
            <Card key={item.id} className="flex flex-col p-5 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-slate-900 dark:text-slate-100">{item.bakeryName}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-3 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{item.address}</span>
              </div>

              <Badge variant="secondary" className="mb-3 w-fit dark:bg-slate-700 dark:text-slate-300">
                {item.specialty}
              </Badge>

              {item.notes && (
                <div className="mb-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedNote}
                        onChange={(e) => setEditedNote(e.target.value)}
                        className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveNote(item.id)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          저장
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="flex-1 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <X className="mr-1 h-3 w-3" />
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="group relative cursor-pointer"
                      onClick={() => startEditing(item.id, item.notes)}
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300">{item.notes}</p>
                      <div className="absolute right-0 top-0 opacity-0 transition-opacity group-hover:opacity-100">
                        <Edit2 className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto flex items-center gap-2 border-t pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <Calendar className="h-3 w-3" />
                <span>
                  {item.addedDate.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  에 추가
                </span>
              </div>

              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={() => toggleVisited(item.id)}
                  className={`w-full ${
                    item.visited
                      ? "bg-slate-400 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-700"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {item.visited ? "미방문" : "방문 완료"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}