import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Star, Heart, Navigation, X } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { bakeryAPI, tagsAPI, wishlistAPI } from "../utils/api-service";
import { useAuth } from "./AuthContext";

declare global {
  interface Window {
    kakao: any;
  }
}

interface BakeryDisplay {
  id: string;
  name: string;
  address: string;
  specialty: string;
  distance: string;
  lat: number;
  lng: number;
  isWishlisted: boolean;
  breadTags: string[];
}

export default function MapPage() {
  const { isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedBakery, setSelectedBakery] = useState<BakeryDisplay | null>(
    null
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);
  const selectedMarkerRef = useRef<any | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [markersLoading, setMarkersLoading] = useState(false);
  const initAttemptsRef = useRef(0);

  const [bakeries, setBakeries] = useState<BakeryDisplay[]>([]);
  const [breadTags, setBreadTags] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      const [bakeryData, tagsData, wishlistData] = await Promise.all([
        bakeryAPI.getAll(),
        tagsAPI.getAll(),
        isLoggedIn ? wishlistAPI.getAll() : Promise.resolve([]),
      ]);

      const displayBakeries: BakeryDisplay[] = bakeryData.map((b) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        specialty:
          (b.bread_tags && b.bread_tags.join(", ")) || b.ai_summary || "",
        distance: "",
        lat: b.latitude ?? 0,
        lng: b.longitude ?? 0,
        isWishlisted: false,
        breadTags: b.bread_tags || [],
      }));

      setBakeries(displayBakeries);
      setBreadTags(tagsData.map((tag) => tag.name));

      const wishlistSet = new Set(
        (wishlistData || []).map((item: any) => item.bakery_id)
      );
      setWishlistIds(wishlistSet);

      // Update isWishlisted status
      setBakeries((prev) =>
        prev.map((b) => ({ ...b, isWishlisted: wishlistSet.has(b.id) }))
      );
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load bakeries, tags, and wishlist on mount
  useEffect(() => {
    loadInitialData();
  }, [isLoggedIn]);

  const filteredBakeries = bakeries.filter((bakery) => {
    // Text search filter
    const matchesSearch =
      searchQuery === "" ||
      bakery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bakery.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    // Bread tag filter
    const matchesTag = selectedTag
      ? bakery.breadTags.some((tag) =>
          tag.toLowerCase().includes(selectedTag.toLowerCase())
        )
      : true;

    return matchesSearch && matchesTag;
  });

  const handleToggleWishlist = async (bakeryId: string) => {
    if (!isLoggedIn) {
      alert("위시리스트에 추가하려면 로그인이 필요합니다.");
      return;
    }

    const isCurrentlyWishlisted = wishlistIds.has(bakeryId);

    try {
      if (isCurrentlyWishlisted) {
        // Find wishlist item to delete
        const wishlistData = await wishlistAPI.getAll();
        const item = wishlistData.find((w) => w.bakery_id === bakeryId);
        if (item) {
          await wishlistAPI.delete(item.id);
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(bakeryId);
            return next;
          });
        }
      } else {
        await wishlistAPI.add(bakeryId);
        setWishlistIds((prev) => new Set(prev).add(bakeryId));
      }

      // Update bakery wishlist status
      setBakeries((prev) =>
        prev.map((b) =>
          b.id === bakeryId ? { ...b, isWishlisted: !isCurrentlyWishlisted } : b
        )
      );

      if (selectedBakery?.id === bakeryId) {
        setSelectedBakery((prev) =>
          prev ? { ...prev, isWishlisted: !isCurrentlyWishlisted } : null
        );
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      alert("위시리스트 업데이트에 실패했습니다.");
    }
  };

  // 카카오맵 초기화
  useEffect(() => {
    const initMap = () => {
      try {
        if (!mapRef.current || !window.kakao || !window.kakao.maps) {
          initAttemptsRef.current = (initAttemptsRef.current || 0) + 1;
          if (initAttemptsRef.current <= 10) {
            setTimeout(initMap, 200);
            return;
          }
          const missing = [] as string[];
          if (!mapRef.current) missing.push("mapRef");
          if (!window.kakao) missing.push("window.kakao");
          else if (!window.kakao.maps) missing.push("window.kakao.maps");
          const msg = `initMap failed after retries; missing: ${missing.join(
            ", "
          )}`;
          console.error(msg);
          setMapError(msg);
          return;
        }

        // 지도 생성
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.2858, 127.0168), // 수원 화성행궁 근처
          level: 5,
        };

        const map = new window.kakao.maps.Map(container, options);
        kakaoMapRef.current = map;

        // 마커 생성
        createMarkers(map, filteredBakeries);
      } catch (err) {
        console.error("initMap error", err);
        setMapError(String(err));
      }
    };

    // 카카오맵 스크립트 로드 확인
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    } else {
      const script = document.createElement("script");
      // include clusterer library for better performance with many markers
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY
      }&libraries=clusterer&autoload=false`;
      script.async = true;
      script.onload = () => {
        setMapError(null);
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(initMap);
        }
      };
      script.onerror = () => {
        console.error("Failed to load Kakao Maps script");
        setMapError(
          "Failed to load Kakao Maps script — check network or API key"
        );
      };
      document.head.appendChild(script);
    }
  }, []);

  // Create markers function
  const createMarkers = (map: any, bakeries: BakeryDisplay[]) => {
    // marker timing removed in production
    // Remove existing clusterer if any
    if (clustererRef.current) {
      try {
        if (clustererRef.current.clear) clustererRef.current.clear();
        if (clustererRef.current.removeMarkers)
          clustererRef.current.removeMarkers(
            markersRef.current.map((m: any) => m.marker)
          );
      } catch (e) {
        // ignore
      }
      clustererRef.current = null;
    }

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.marker.setMap(null));
    markersRef.current = [];

    // Filter bakeries with valid coordinates
    const bakeriesWithCoords = bakeries.filter(
      (bakery) => bakery.lat !== 0 && bakery.lng !== 0
    );

    // Create markers in batches to avoid blocking UI when there are many (e.g., 450+)
    const batchSize = 100;
    let idx = 0;
    setMarkersLoading(true);

    const createBatch = () => {
      const end = Math.min(idx + batchSize, bakeriesWithCoords.length);
      for (; idx < end; idx++) {
        const bakery = bakeriesWithCoords[idx];
        const markerPosition = new window.kakao.maps.LatLng(
          bakery.lat,
          bakery.lng
        );

        // Create small SVG marker images for default and selected states
        const makeMarkerImage = (color: string, size = 26) => {
          const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><circle cx='${
            size / 2
          }' cy='${size / 2}' r='${
            size / 2 - 1
          }' fill='${color}' stroke='white' stroke-width='2'/></svg>`;
          const url =
            "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
          return new window.kakao.maps.MarkerImage(
            url,
            new window.kakao.maps.Size(size, size),
            { offset: new window.kakao.maps.Point(size / 2, size / 2) }
          );
        };

        const defaultImage = makeMarkerImage("#94a3b8", 22);
        const selectedImage = makeMarkerImage("#f59e0b", 30);

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          title: `${idx + 1}. ${bakery.name}`,
          image: defaultImage,
        });
        // attach meta for later
        (marker as any).__bakeryId = bakery.id;
        (marker as any).__defaultImage = defaultImage;
        (marker as any).__selectedImage = selectedImage;

        window.kakao.maps.event.addListener(marker, "click", () => {
          setSelectedBakery(bakery);
          // visually highlight marker immediately
          setSelectedMarkerById(bakery.id);
          map.panTo(markerPosition);
        });

        markersRef.current.push({ marker, bakeryId: bakery.id });
      }

      // batch progress (silenced in production)
      if (idx < bakeriesWithCoords.length) {
        // schedule next batch
        setTimeout(createBatch, 20);
      } else {
        // all markers created, attach to map or clusterer
        finalizeMarkers();
      }
    };

    // (selection helpers moved to component scope)

    const finalizeMarkers = () => {
      setMarkersLoading(false);
      if (window.kakao.maps.MarkerClusterer) {
        try {
          clustererRef.current = new window.kakao.maps.MarkerClusterer({
            map: map,
            averageCenter: true,
            minLevel: 7,
          });
          clustererRef.current.addMarkers(
            markersRef.current.map((m: any) => m.marker)
          );
        } catch (e) {
          markersRef.current.forEach((m) => m.marker.setMap(map));
        }
      } else {
        markersRef.current.forEach((m) => m.marker.setMap(map));
      }

      // restore selected marker if any
      setSelectedMarkerById(selectedBakery?.id);
    };

    // kick off first batch
    createBatch();

    // marker creation happens in batches; finalizeMarkers will attach markers
  };

  // Selection helpers (component scope so effects can call them)
  const clearSelectedMarker = () => {
    if (selectedMarkerRef.current) {
      try {
        selectedMarkerRef.current.setImage(
          selectedMarkerRef.current.__defaultImage
        );
        selectedMarkerRef.current.setZIndex(0);
      } catch (e) {
        /* ignore */
      }
      selectedMarkerRef.current = null;
    }
  };

  const setSelectedMarkerById = (bakeryId?: string | null) => {
    // clear current selection
    clearSelectedMarker();
    if (!bakeryId) return;
    const found = markersRef.current.find((m: any) => m.bakeryId === bakeryId);
    if (found) {
      try {
        const m = found.marker;
        m.setImage(m.__selectedImage);
        m.setZIndex(9999);
        selectedMarkerRef.current = m;
      } catch (e) {
        // ignore
      }
    }
  };

  // 검색 결과 변경시 마커 업데이트
  useEffect(() => {
    if (kakaoMapRef.current) {
      createMarkers(kakaoMapRef.current, filteredBakeries);
    }
  }, [searchQuery, selectedTag, filteredBakeries.length]);

  // 선택된 빵집 변경시 마커 업데이트
  useEffect(() => {
    if (kakaoMapRef.current) {
      // highlight the selected marker instead of recreating all markers
      setSelectedMarkerById(selectedBakery?.id);
      if (
        selectedBakery &&
        selectedBakery.lat !== 0 &&
        selectedBakery.lng !== 0
      ) {
        const moveLatLng = new window.kakao.maps.LatLng(
          selectedBakery.lat,
          selectedBakery.lng
        );
        kakaoMapRef.current.panTo(moveLatLng);
      }
    }
  }, [selectedBakery]);

  // 내 위치로 이동
  const handleMyLocation = () => {
    if (navigator.geolocation && kakaoMapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const moveLatLng = new window.kakao.maps.LatLng(lat, lng);
          kakaoMapRef.current.panTo(moveLatLng);
        },
        (_error) => {
          alert("현재 위치를 가져올 수 없습니다.");
        }
      );
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
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-slate-900 dark:text-slate-100">지도 및 검색</h2>
        <p className="text-slate-600 dark:text-slate-400">
          내 주변 빵집을 찾아보세요
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="빵집 이름 또는 빵 종류로 검색..."
            className="pl-10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 dark:border-slate-600 dark:hover:bg-slate-700"
          onClick={handleMyLocation}
        >
          <Navigation className="h-4 w-4" />내 위치
        </Button>
      </div>

      {/* Bread Tags Filter */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {breadTags.map((tag) => {
            const isSelected = selectedTag === tag;
            // 현재 tag를 가진 빵집 개수 계산
            const count = bakeries.filter((b) =>
              b.breadTags.includes(tag)
            ).length;

            return (
              <Button
                key={tag}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={
                  isSelected
                    ? "gap-1.5 bg-amber-500 hover:bg-amber-600"
                    : "gap-1.5 dark:border-slate-600 dark:hover:bg-slate-700"
                }
              >
                <span>{tag}</span>
                <Badge
                  variant="secondary"
                  className={`h-5 min-w-5 px-1.5 ${
                    isSelected
                      ? "bg-amber-600 text-white dark:bg-amber-700"
                      : "bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-4 overflow-hidden">
        {/* Map Area */}
        <Card className="col-span-2 relative overflow-hidden p-0 dark:border-slate-700 dark:bg-slate-800">
          <div ref={mapRef} className="w-full" style={{ height: "600px" }} />

          {/* Map error overlay */}
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 p-4">
              <div className="text-center">
                <p className="text-sm text-red-600">{mapError}</p>
                <button
                  className="mt-2 rounded bg-amber-500 px-3 py-1 text-white"
                  onClick={() => {
                    setMapError(null);
                    // try reloading script/init
                    if (
                      window.kakao &&
                      window.kakao.maps &&
                      kakaoMapRef.current
                    ) {
                      createMarkers(kakaoMapRef.current, filteredBakeries);
                    } else {
                      window.location.reload();
                    }
                  }}
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* Markers loading overlay */}
          {markersLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <p className="text-sm text-slate-700">마커를 배치하는 중...</p>
            </div>
          )}

          {/* API Key 안내 메시지 */}
          {!(window.kakao && window.kakao.maps) && (
            <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 p-3 text-xs shadow-lg backdrop-blur-sm dark:bg-slate-800/90">
              <p className="text-amber-600 dark:text-amber-500">
                ⚠️ 카카오맵을 사용하려면 API 키가 필요합니다
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                MapPage.tsx 파일의 VITE_KAKAO_JAVASCRIPT_KEY를
                <br />
                실제 API 키로 교체해주세요
              </p>
              <a
                href="https://developers.kakao.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-blue-600 hover:underline dark:text-blue-400"
              >
                카카오 개발자 센터에서 API 키 발급 →
              </a>
            </div>
          )}

          {/* Selected Bakery Info Card */}
          {selectedBakery && (
            <div className="absolute bottom-4 right-4 w-80 z-50">
              <Card className="p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-slate-900 dark:text-slate-100">
                      {selectedBakery.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedBakery.address}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {selectedBakery.distance}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="mt-2 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {selectedBakery.specialty}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant={
                      selectedBakery.isWishlisted ? "default" : "outline"
                    }
                    onClick={() => handleToggleWishlist(selectedBakery.id)}
                    className={
                      selectedBakery.isWishlisted
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "dark:border-slate-600"
                    }
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        selectedBakery.isWishlisted ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </Card>

        {/* Bakery List */}
        <Card className="flex flex-col overflow-hidden p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-slate-900 dark:text-slate-100">
            빵집 목록 ({filteredBakeries.length})
          </h3>
          <div className="space-y-3 overflow-auto">
            {filteredBakeries.map((bakery, index) => (
              <Card
                key={bakery.id}
                className={`cursor-pointer p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 ${
                  selectedBakery?.id === bakery.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                    : ""
                }`}
                onClick={() => {
                  setSelectedBakery(bakery);
                  if (
                    kakaoMapRef.current &&
                    bakery.lat !== 0 &&
                    bakery.lng !== 0
                  ) {
                    const moveLatLng = new window.kakao.maps.LatLng(
                      bakery.lat,
                      bakery.lng
                    );
                    kakaoMapRef.current.panTo(moveLatLng);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-slate-900 dark:text-slate-100">
                        {bakery.name}
                      </h4>
                      <Heart
                        className={`h-4 w-4 shrink-0 cursor-pointer transition-colors hover:text-amber-500 ${
                          bakery.isWishlisted
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent bakery card click
                          handleToggleWishlist(bakery.id);
                        }}
                      />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        {bakery.distance}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {bakery.specialty}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
