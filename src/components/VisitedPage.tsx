import { useState, useEffect } from "react";
import { Calendar, Star, Image as ImageIcon, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./AuthContext";
import LoginPrompt from "./LoginPrompt";
import { visitRecordsAPI, VisitRecord as APIVisitRecord, bakeryAPI, Bakery } from "../utils/api-service";

interface VisitRecordDisplay {
  id: string;
  bakeryId: string;
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
  const [records, setRecords] = useState<VisitRecordDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load visit records on mount
  useEffect(() => {
    loadVisitRecords();
  }, []);

  const loadVisitRecords = async () => {
    try {
      setIsLoading(true);
      const apiRecords = await visitRecordsAPI.getAll();
      const displayRecords: VisitRecordDisplay[] = apiRecords.map((record) => ({
        id: record.id,
        bakeryId: record.bakery_id,
        bakeryName: record.bakery_name,
        visitDate: new Date(record.visit_date),
        rating: record.rating,
        review: record.review || "",
        photos: [],
        items: record.bread_purchased ? record.bread_purchased.split(",").map(s => s.trim()) : [],
      }));
      setRecords(displayRecords);
    } catch (error) {
      console.error("Failed to load visit records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchBakeries = async (query: string) => {
    if (!query.trim()) {
      setBakerySearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await bakeryAPI.search({ name: query, limit: 10 });
      setBakerySearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Failed to search bakeries:", error);
      setBakerySearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectBakery = (bakery: Bakery) => {
    setNewRecord({
      ...newRecord,
      bakeryId: bakery.id,
      bakeryName: bakery.name,
    });
    setBakerySearchQuery(bakery.name);
    setShowSearchResults(false);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState({
    bakeryId: "",
    bakeryName: "",
    visitDate: new Date().toISOString().split("T")[0],
    rating: 5,
    review: "",
    items: "",
  });
  const [editRecord, setEditRecord] = useState({
    visitDate: "",
    rating: 5,
    review: "",
    items: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [bakerySearchQuery, setBakerySearchQuery] = useState("");
  const [bakerySearchResults, setBakerySearchResults] = useState<Bakery[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSubmit = async () => {
    // Require either bakeryId (from search) or bakeryName (free text)
    if ((!newRecord.bakeryId && !newRecord.bakeryName) || !newRecord.review) {
      alert("빵집 이름과 후기를 모두 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      await visitRecordsAPI.create({
        bakery_id: newRecord.bakeryId || undefined,
        bakery_name: newRecord.bakeryId ? undefined : newRecord.bakeryName,
        visit_date: newRecord.visitDate,
        rating: newRecord.rating,
        bread_purchased: newRecord.items,
        review: newRecord.review,
      });

      await loadVisitRecords();
      setIsDialogOpen(false);
      setNewRecord({
        bakeryId: "",
        bakeryName: "",
        visitDate: new Date().toISOString().split("T")[0],
        rating: 5,
        review: "",
        items: "",
      });
      setBakerySearchQuery("");
      setBakerySearchResults([]);
      setShowSearchResults(false);
    } catch (error) {
      console.error("Failed to create visit record:", error);
      alert("방문 기록 추가에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await visitRecordsAPI.delete(id);
      setRecords((prev) => prev.filter((record) => record.id !== id));
    } catch (error) {
      console.error("Failed to delete visit record:", error);
      alert("방문 기록 삭제에 실패했습니다.");
    }
  };

  const startEditing = (record: VisitRecordDisplay) => {
    setEditingId(record.id);
    setEditRecord({
      visitDate: record.visitDate.toISOString().split("T")[0],
      rating: record.rating,
      review: record.review,
      items: record.items.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;

    try {
      setIsSaving(true);
      await visitRecordsAPI.update(editingId, {
        visit_date: editRecord.visitDate,
        rating: editRecord.rating,
        bread_purchased: editRecord.items,
        review: editRecord.review,
      });

      await loadVisitRecords();
      setIsEditDialogOpen(false);
      setEditingId(null);
      setEditRecord({
        visitDate: "",
        rating: 5,
        review: "",
        items: "",
      });
    } catch (error) {
      console.error("Failed to update visit record:", error);
      alert("방문 기록 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">로딩 중...</p>
      </div>
    );
  }

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:border-slate-700 dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-slate-100">새 방문 기록 작성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-visible">
              <div className="relative min-h-[100px]">
                <Label htmlFor="bakeryName" className="dark:text-slate-200">
                  빵집 이름 (검색하거나 직접 입력)
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="bakeryName"
                    value={bakerySearchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBakerySearchQuery(value);
                      setNewRecord({ ...newRecord, bakeryName: value, bakeryId: "" });
                      searchBakeries(value);
                    }}
                    onFocus={() => {
                      if (bakerySearchQuery && bakerySearchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    placeholder="빵집 이름을 검색하거나 입력하세요"
                    className="pl-10 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                  {showSearchResults && bakerySearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                      {bakerySearchResults.map((bakery) => (
                        <button
                          key={bakery.id}
                          type="button"
                          onClick={() => selectBakery(bakery)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <div className="font-medium text-slate-900 dark:text-slate-100">{bakery.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{bakery.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 min-h-[40px]">
                  {isSearching && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">검색 중...</div>
                  )}
                  {newRecord.bakeryId ? (
                    <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      ✓ 선택됨: {newRecord.bakeryName}
                    </div>
                  ) : newRecord.bakeryName ? (
                    <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      새 빵집으로 저장됨: {newRecord.bakeryName}
                    </div>
                  ) : null}
                </div>
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setBakerySearchQuery("");
                    setBakerySearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="dark:border-slate-600 dark:hover:bg-slate-700"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-amber-500 hover:bg-amber-600"
                  disabled={isSaving || (!newRecord.bakeryId && !newRecord.bakeryName) || !newRecord.review}
                >
                  {isSaving ? "저장 중..." : "저장"}
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
                  disabled={isSaving || !editRecord.review}
                >
                  {isSaving ? "저장 중..." : "저장"}
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