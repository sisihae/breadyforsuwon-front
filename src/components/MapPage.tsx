import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Star, Heart, Navigation, X } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

declare global {
  interface Window {
    kakao: any;
  }
}

interface Bakery {
  id: string;
  name: string;
  address: string;
  rating: number;
  specialty: string;
  distance: string;
  lat: number;
  lng: number;
  isWishlisted: boolean;
  breadTags: string[];
}

// Bread tag 목록
const BREAD_TAGS = [
  "크루아상",
  "식빵",
  "타르트",
  "카눌레",
  "소금빵",
  "단팥빵",
  "크림빵",
  "소보로빵",
  "바게트",
  "데니쉬",
];

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedBakery, setSelectedBakery] = useState<Bakery | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Mock bakery data - 수원 실제 좌표 근처
  const bakeries: Bakery[] = [
    {
      id: "1",
      name: "르뱅드마리",
      address: "경기 수원시 팔달구 행궁로 30",
      rating: 4.8,
      specialty: "천연발효빵, 크루아상",
      distance: "0.5km",
      lat: 37.2858,
      lng: 127.0168,
      isWishlisted: false,
      breadTags: ["크루아상", "바게트", "데니쉬"],
    },
    {
      id: "2",
      name: "베이커리카페 밀",
      address: "경기 수원시 영통구 광교중앙로 248",
      rating: 4.6,
      specialty: "소금빵, 카눌레",
      distance: "1.2km",
      lat: 37.2975,
      lng: 127.0456,
      isWishlisted: true,
      breadTags: ["소금빵", "카눌레", "크루아상"],
    },
    {
      id: "3",
      name: "빵굽는날",
      address: "경기 수원시 팔달구 정조로 906",
      rating: 4.7,
      specialty: "단팥빵, 크림빵",
      distance: "0.8km",
      lat: 37.2702,
      lng: 127.0012,
      isWishlisted: false,
      breadTags: ["단팥빵", "크림빵", "식빵"],
    },
    {
      id: "4",
      name: "수제빵공방 온",
      address: "경기 수원시 팔달구 행궁로 102",
      rating: 4.5,
      specialty: "말차크림빵, 소보로빵",
      distance: "0.6km",
      lat: 37.2834,
      lng: 127.0145,
      isWishlisted: false,
      breadTags: ["소보로빵", "크림빵", "타르트"],
    },
  ];

  const filteredBakeries = bakeries.filter((bakery) => {
    // 텍스트 검색 필터
    const matchesSearch =
      bakery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bakery.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    // Bread tag 필터
    const matchesTag = selectedTag
      ? bakery.breadTags.includes(selectedTag)
      : true;

    return matchesSearch && matchesTag;
  });

  // 카카오맵 초기화
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.kakao || !window.kakao.maps) {
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
    };

    // 카카오맵 스크립트 로드 확인
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    } else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false`;
      script.async = true;
      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(initMap);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  // 마커 생성 함수
  const createMarkers = (map: any, bakeries: Bakery[]) => {
    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    bakeries.forEach((bakery, index) => {
      const markerPosition = new window.kakao.maps.LatLng(
        bakery.lat,
        bakery.lng
      );

      // 커스텀 마커 이미지 생성
      const markerContent = `
        <div style="position: relative; cursor: pointer;">
          <div style="
            background-color: ${
              selectedBakery?.id === bakery.id ? "#f59e0b" : "#ef4444"
            };
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            font-size: 14px;
            white-space: nowrap;
          ">
            ${index + 1}. ${bakery.name}
          </div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid ${
              selectedBakery?.id === bakery.id ? "#f59e0b" : "#ef4444"
            };
          "></div>
        </div>
      `;

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: markerPosition,
        content: markerContent,
        yAnchor: 1.3,
      });

      customOverlay.setMap(map);
      markersRef.current.push(customOverlay);

      // 마커 클릭 이벤트
      const markerElement = customOverlay.getContent();
      markerElement.addEventListener("click", () => {
        setSelectedBakery(bakery);
        map.panTo(markerPosition);
      });
    });
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
      createMarkers(kakaoMapRef.current, filteredBakeries);
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
        (error) => {
          alert("현재 위치를 가져올 수 없습니다.");
        }
      );
    }
  };

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
          {BREAD_TAGS.map((tag) => {
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
          <div
            ref={mapRef}
            className="h-full w-full"
            style={{ minHeight: "500px" }}
          />

          {/* API Key 안내 메시지 */}
          <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 p-3 text-xs shadow-lg backdrop-blur-sm dark:bg-slate-800/90">
            <p className="text-amber-600 dark:text-amber-500">
              ⚠️ 카카오맵을 사용하려면 API 키가 필요합니다
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              MapPage.tsx 파일의 YOUR_KAKAO_MAP_API_KEY를
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

          {/* Selected Bakery Info Card */}
          {selectedBakery && (
            <div className="absolute bottom-4 right-4 w-80">
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
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm dark:text-slate-200">
                          {selectedBakery.rating}
                        </span>
                      </div>
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
                  if (kakaoMapRef.current) {
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
                        className={`h-4 w-4 shrink-0 ${
                          bakery.isWishlisted
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
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
