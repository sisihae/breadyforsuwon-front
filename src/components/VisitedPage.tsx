import { useState } from "react";
import { Calendar, Star, Image as ImageIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./AuthContext";
import LoginPrompt from "./LoginPrompt";

interface VisitRecord {
  id: string;
  bakeryName: string;
  visitDate: Date;
  rating: number;
  review: string;
  photos: string[];
  items: string[];
}

export default function VisitedPage() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <LoginPrompt />;
  }
  const [records, setRecords] = useState<VisitRecord[]>([
    {
      id: "1",
      bakeryName: "빵굽는날",
      visitDate: new Date("2024-11-25"),
      rating: 5,
      review: "단팥빵이 정말 맛있었어요! 팥이 달지 않고 고소해서 두 개나 먹었습니다. 오후 3시쯤 갔더니 갓 구운 빵을 먹을 수 있었어요. 다음에는 크림빵도 꼭 먹어보고 싶어요.",
      photos: [],
      items: ["단팥빵", "크림빵"],
    },
    {
      id: "2",
      bakeryName: "르뱅드마리",
      visitDate: new Date("2024-11-20"),
      rating: 4,
      review: "크루아상 맛집이라는 소문대로 정말 바삭하고 버터 향이 좋았습니다. 주말이라 사람이 많았지만 기다릴 만한 가치가 있었어요.",
      photos: [],
      items: ["크루아상", "바게트"],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState({
    bakeryName: "",
    visitDate: new Date().toISOString().split("T")[0],
    rating: 5,
    review: "",
    items: "",
  });
  const [editRecord, setEditRecord] = useState({
    bakeryName: "",
    visitDate: "",
    rating: 5,
    review: "",
    items: "",
  });

  const handleSubmit = () => {
    const record: VisitRecord = {
      id: Date.now().toString(),
      bakeryName: newRecord.bakeryName,
      visitDate: new Date(newRecord.visitDate),
      rating: newRecord.rating,
      review: newRecord.review,
      photos: [],
      items: newRecord.items.split(",").map((item) => item.trim()),
    };
    setRecords((prev) => [record, ...prev]);
    setIsDialogOpen(false);
    setNewRecord({
      bakeryName: "",
      visitDate: new Date().toISOString().split("T")[0],
      rating: 5,
      review: "",
      items: "",
    });
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const startEditing = (record: VisitRecord) => {
    setEditingId(record.id);
    setEditRecord({
      bakeryName: record.bakeryName,
      visitDate: record.visitDate.toISOString().split("T")[0],
      rating: record.rating,
      review: record.review,
      items: record.items.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingId) return;
    
    setRecords((prev) =>
      prev.map((record) =>
        record.id === editingId
          ? {
              ...record,
              bakeryName: editRecord.bakeryName,
              visitDate: new Date(editRecord.visitDate),
              rating: editRecord.rating,
              review: editRecord.review,
              items: editRecord.items.split(",").map((item) => item.trim()),
            }
          : record
      )
    );
    setIsEditDialogOpen(false);
    setEditingId(null);
    setEditRecord({
      bakeryName: "",
      visitDate: "",
      rating: 5,
      review: "",
      items: "",
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100">방문 기록</h2>
          <p className="text-slate-600 dark:text-slate-400">
            총 {records.length}곳의 빵집을 방문했습니다
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4" />
              방문 기록 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl dark:border-slate-700 dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-slate-100">새 방문 기록 작성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bakeryName" className="dark:text-slate-200">빵집 이름</Label>
                <Input
                  id="bakeryName"
                  value={newRecord.bakeryName}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, bakeryName: e.target.value })
                  }
                  placeholder="빵집 이름을 입력하세요"
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="visitDate" className="dark:text-slate-200">방문 날짜</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={newRecord.visitDate}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, visitDate: e.target.value })
                  }
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="rating" className="dark:text-slate-200">평점</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRecord({ ...newRecord, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= newRecord.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="items" className="dark:text-slate-200">구매한 빵 (쉼표로 구분)</Label>
                <Input
                  id="items"
                  value={newRecord.items}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, items: e.target.value })
                  }
                  placeholder="예: 크루아상, 바게트, 소금빵"
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="review" className="dark:text-slate-200">후기</Label>
                <Textarea
                  id="review"
                  value={newRecord.review}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, review: e.target.value })
                  }
                  placeholder="방문 경험을 자유롭게 작성해주세요..."
                  rows={5}
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-slate-600 dark:hover:bg-slate-700">
                  취소
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-amber-500 hover:bg-amber-600"
                  disabled={!newRecord.bakeryName || !newRecord.review}
                >
                  저장
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl dark:border-slate-700 dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-slate-100">방문 기록 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editBakeryName" className="dark:text-slate-200">빵집 이름</Label>
                <Input
                  id="editBakeryName"
                  value={editRecord.bakeryName}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, bakeryName: e.target.value })
                  }
                  placeholder="빵집 이름을 입력하세요"
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="editVisitDate" className="dark:text-slate-200">방문 날짜</Label>
                <Input
                  id="editVisitDate"
                  type="date"
                  value={editRecord.visitDate}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, visitDate: e.target.value })
                  }
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="editRating" className="dark:text-slate-200">평점</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRecord({ ...editRecord, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= editRecord.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="editItems" className="dark:text-slate-200">구매한 빵 (쉼표로 구분)</Label>
                <Input
                  id="editItems"
                  value={editRecord.items}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, items: e.target.value })
                  }
                  placeholder="예: 크루아상, 바게트, 소금빵"
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="editReview" className="dark:text-slate-200">후기</Label>
                <Textarea
                  id="editReview"
                  value={editRecord.review}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, review: e.target.value })
                  }
                  placeholder="방문 경험을 자유롭게 작성해주세요..."
                  rows={5}
                  className="dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="dark:border-slate-600 dark:hover:bg-slate-700">
                  취소
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  className="bg-amber-500 hover:bg-amber-600"
                  disabled={!editRecord.bakeryName || !editRecord.review}
                >
                  저장
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 overflow-auto">
        {records.map((record) => (
          <Card key={record.id} className="p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-slate-100">{record.bakeryName}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {record.visitDate.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= record.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(record)}
                    className="text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{record.review}</p>
            </div>

            {record.items.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {record.items.map((item, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            {record.photos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {record.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700"
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <ImageIcon className="h-4 w-4" />
                <span>사진을 추가하면 더 생생한 기록을 남길 수 있어요</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}