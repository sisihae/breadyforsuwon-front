import { createBrowserRouter } from "react-router";
import Layout from "../components/Layout";
import ChatbotPage from "../components/ChatbotPage";
import MapPage from "../components/MapPage";
import WishlistPage from "../components/WishlistPage";
import VisitedPage from "../components/VisitedPage";
import MyPage from "../components/MyPage";
import KakaoCallback from "../components/KakaoCallback";

export const router = createBrowserRouter([
  {
    path: "/auth/kakao/callback",
    element: <KakaoCallback />,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <ChatbotPage /> },
      { path: "chatbot", element: <ChatbotPage /> },
      { path: "map", element: <MapPage /> },
      { path: "wishlist", element: <WishlistPage /> },
      { path: "visited", element: <VisitedPage /> },
      { path: "mypage", element: <MyPage /> },
    ],
  },
]);
