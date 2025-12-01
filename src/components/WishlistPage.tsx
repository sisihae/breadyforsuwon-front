import { useState } from "react";
import { Heart, MapPin, Star, Trash2, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface WishlistItem {
  id: string;
  bakeryName: string;
  address: string;
  specialty: string;
  rating: number;
  addedDate: Date;
  notes: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    {
      id: "1",
      bakeryName: "르뱅드마리",
      address: "경기 수원시 팔달구 행궁로 30",
      specialty: "천연발효빵, 크루아상",
      rating: 4.8,
      addedDate: new Date("2024-11-15"),
      notes: "크루아상 꼭 먹어보기!",
    },
    {
      id: "2",
      bakeryName: "베이커리카페 밀",
      address: "경기 수원시 영통구 광교중앙로 248",
      specialty: "소금빵, 카눌레",
      rating: 4.6,
      addedDate: new Date("2024-11-20"),
      notes: "아침 일찍 방문 예정",
    },
    {
      id: "3",
      bakeryName: "수제빵공방 온",
      address: "경기 수원시 팔달구 행궁로 102",
      specialty: "말차크림빵, 소보로빵",
      rating: 4.5,
      addedDate: new Date("2024-11-28"),
      notes: "친구랑 같이 가기",
    },
  ]);

  const handleRemove = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-slate-900">위시리스트</h2>
        <p className="text-slate-600">
          방문하고 싶은 빵집 {wishlist.length}곳
        </p>
      </div>

      {wishlist.length === 0 ? (
        <Card className="flex flex-1 flex-col items-center justify-center p-12">
          <Heart className="mb-4 h-16 w-16 text-slate-300" />
          <h3 className="text-slate-900">위시리스트가 비어있습니다</h3>
          <p className="text-slate-600">
            지도에서 마음에 드는 빵집을 추가해보세요
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <Card key={item.id} className="flex flex-col p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-slate-900">{item.bakeryName}</h3>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-3 flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{item.address}</span>
              </div>

              <Badge variant="secondary" className="mb-3 w-fit">
                {item.specialty}
              </Badge>

              {item.notes && (
                <div className="mb-3 rounded-lg bg-amber-50 p-3">
                  <p className="text-sm text-slate-700">{item.notes}</p>
                </div>
              )}

              <div className="mt-auto flex items-center gap-2 border-t pt-3 text-xs text-slate-500">
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

              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  지도에서 보기
                </Button>
                <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600">
                  방문 완료
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
