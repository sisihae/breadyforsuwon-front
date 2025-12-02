# Bready for Suwon - API Documentation

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Context APIs](#context-apis)
- [Routing](#routing)
- [Styling System](#styling-system)
- [External Integrations](#external-integrations)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)

---

## 🎯 Project Overview

**Bready for Suwon** is a bakery tour website for Suwon city, designed for PC web browsers. The application features a chatbot for bakery information, an interactive map, wishlist management, visit tracking, and user profile management.

### Key Features

- ✅ Chatbot powered by Vector DB
- ✅ Interactive Kakao Map integration
- ✅ Wishlist & Visit History tracking
- ✅ Kakao Social Login
- ✅ Dark mode support
- ✅ Mobile responsive design

### Access Control

- **Public Access**: Chatbot, Map & Search
- **Login Required**: Wishlist, Visit History, My Page

---

## 🛠 Tech Stack

| Category      | Technology           |
| ------------- | -------------------- |
| Framework     | React 18.3.1         |
| Language      | TypeScript 5.3.3     |
| Routing       | React Router 7.0.1   |
| Styling       | Tailwind CSS 4.0.0   |
| UI Components | Radix UI + shadcn/ui |
| Icons         | Lucide React         |
| Charts        | Recharts             |
| Build Tool    | Vite 5.1.0           |

---

## 📁 Project Structure

```
bready-for-suwon/
├── src/
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Application entry point
│   │
│   ├── components/
│   │   ├── AuthContext.tsx        # Authentication state management
│   │   ├── ThemeProvider.tsx      # Dark mode state management
│   │   ├── Layout.tsx             # Main layout with header & navigation
│   │   ├── LoginPrompt.tsx        # Kakao login modal
│   │   ├── ChatbotPage.tsx        # Chatbot interface
│   │   ├── MapPage.tsx            # Kakao Map integration
│   │   ├── WishlistPage.tsx       # User wishlist
│   │   ├── VisitedPage.tsx        # Visit history
│   │   ├── MyPage.tsx             # User profile
│   │   │
│   │   └── ui/                    # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── switch.tsx
│   │       └── ...
│   │
│   ├── utils/
│   │   └── routes.ts              # React Router configuration
│   │
│   └── styles/
│       └── globals.css            # Global styles & Tailwind config
│
├── index.html                     # HTML entry point
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
└── postcss.config.js              # PostCSS configuration
```

---

## 🧩 Core Components

### App Component

**File**: `/src/App.tsx`

Root component that provides global context providers.

```tsx
import { RouterProvider } from "react-router";
import { router } from "./utils/routes";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./components/AuthContext";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
```

**Provider Hierarchy**:

1. `ThemeProvider` - Manages dark/light mode
2. `AuthProvider` - Manages authentication state
3. `RouterProvider` - Handles routing

---

### Layout Component

**File**: `/src/components/Layout.tsx`

Main layout wrapper with header, navigation tabs, and content area.

**Props**: None (uses Outlet for nested routes)

**Features**:

- Responsive header with logo and tagline
- Dark mode toggle switch
- User authentication display
- Logout functionality
- Tab-based navigation
- Mobile-optimized design

**Navigation Items**:

```tsx
const navItems = [
  { path: "/chatbot", icon: MessageCircle, label: "챗봇" },
  { path: "/map", icon: Map, label: "지도 및 검색" },
  { path: "/wishlist", icon: Heart, label: "위시리스트" },
  { path: "/visited", icon: BookOpen, label: "방문 기록" },
  { path: "/mypage", icon: User, label: "마이페이지" },
];
```

**Hooks Used**:

- `useTheme()` - Access theme state
- `useAuth()` - Access authentication state

---

### ChatbotPage Component

**File**: `/src/components/ChatbotPage.tsx`

AI-powered chatbot interface for bakery information.

**Features**:

- Chat message display
- User input field
- Send button
- Vector DB integration (backend required)
- Auto-scroll to latest message

**State**:

```tsx
const [messages, setMessages] = useState<
  Array<{
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
  }>
>([]);
const [input, setInput] = useState("");
```

**API Integration** (To be implemented):

```tsx
// POST /api/chatbot/query
{
  message: string,
  userId?: string
}

// Response
{
  response: string,
  relatedBakeries?: Array<{
    id: string,
    name: string,
    location: string
  }>
}
```

---

### MapPage Component

**File**: `/src/components/MapPage.tsx`

Interactive map showing bakeries in Suwon using Kakao Map API.

**Features**:

- Text search functionality (by bakery name or specialty)
- **Bread tag filtering** (크루아상, 식빵, 타르트, 카눌레, 소금빵, 단팥빵, 크림빵, 소보로빵, 바게트, 데니쉬)
- Interactive tag buttons with bakery count badges
- Real-time map marker updates based on filters
- Bakery markers on map with custom overlay design
- Info card on marker/list item click
- "My Location" button for geolocation
- Add to wishlist button
- Responsive three-column layout (map + sidebar)

**State Management**:

```tsx
const [searchQuery, setSearchQuery] = useState("");
const [selectedTag, setSelectedTag] = useState<string | null>(null);
const [selectedBakery, setSelectedBakery] = useState<Bakery | null>(null);
```

**Bread Tags**:

```tsx
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
```

**Filtering Logic**:

```tsx
const filteredBakeries = bakeries.filter((bakery) => {
  // Text search filter (name or specialty)
  const matchesSearch =
    bakery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bakery.specialty.toLowerCase().includes(searchQuery.toLowerCase());

  // Bread tag filter
  const matchesTag = selectedTag
    ? bakery.breadTags.includes(selectedTag)
    : true;

  return matchesSearch && matchesTag;
});
```

**Required Environment Variables**:

```env
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

**Kakao Map API Integration**:

```tsx
// Initialize Kakao Map
const container = document.getElementById("map");
const options = {
  center: new kakao.maps.LatLng(37.2636, 127.0286), // Suwon coordinates
  level: 5,
};
const map = new kakao.maps.Map(container, options);

// Add marker
const marker = new kakao.maps.Marker({
  position: new kakao.maps.LatLng(lat, lng),
  map: map,
});
```

**Bakery Data Structure**:

```tsx
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
  breadTags: string[]; // Array of bread types this bakery offers
}
```

**Example Bakery Data**:

```tsx
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
  breadTags: ["크루아상", "바게트", "데니쉬"]
}
```

**UI Components**:

- Search input with text filtering
- Bread tag filter buttons (10 types) with count badges
- Toggle selection by clicking tag buttons
- Interactive Kakao map with custom markers
- Bakery list sidebar with click-to-select
- Selected bakery info card overlay
- "My Location" button for geolocation

---

### WishlistPage Component

**File**: `/src/components/WishlistPage.tsx`

User's saved bakery list (requires login).

**Features**:

- Grid/List view toggle
- Remove from wishlist
- View bakery details
- Share wishlist

**Protected Route**: ✅ Requires authentication

**API Endpoints** (To be implemented):

```tsx
// GET /api/wishlist
// Response: Bakery[]

// POST /api/wishlist/:bakeryId
// Add to wishlist

// DELETE /api/wishlist/:bakeryId
// Remove from wishlist
```

---

### VisitedPage Component

**File**: `/src/components/VisitedPage.tsx`

Track and review visited bakeries (requires login).

**Features**:

- Visit history list
- Add review & rating
- Upload photos
- Visit date tracking
- Statistics dashboard

**Protected Route**: ✅ Requires authentication

**Visit Record Structure**:

```tsx
interface VisitRecord {
  id: string;
  bakeryId: string;
  bakeryName: string;
  visitDate: Date;
  rating?: number;
  review?: string;
  photos?: string[];
}
```

---

### MyPage Component

**File**: `/src/components/MyPage.tsx`

User profile and settings (requires login).

**Features**:

- User information display
- Profile photo
- Visit statistics
- Wishlist summary
- Account settings
- Logout button

**Protected Route**: ✅ Requires authentication

**User Profile Structure**:

```tsx
interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  kakaoId: string;
  joinDate: Date;
  visitCount: number;
  wishlistCount: number;
}
```

---

### LoginPrompt Component

**File**: `/src/components/LoginPrompt.tsx`

Modal dialog for Kakao social login.

**Props**:

```tsx
interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:

- Kakao OAuth login button
- Login explanation
- Responsive design

**Kakao OAuth Login Flow**:

```tsx
const handleKakaoLogin = async () => {
  try {
    // Step 1: Get Kakao OAuth authorize URL from backend
    const response = await fetch("/auth/kakao/login");
    const data = await response.json();

    // Step 2: Redirect user to Kakao OAuth page
    window.location.href = data.authorize_url;

    // Step 3: Kakao redirects back to /auth/kakao/callback with code
    // Step 4: Backend exchanges code for token and sets session cookie
    // Step 5: Backend redirects user back to frontend
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

**Authentication Flow**:

1. User clicks "Login with Kakao" button
2. Frontend calls `GET /auth/kakao/login` to get OAuth URL
3. User is redirected to Kakao authorization page
4. User approves and Kakao redirects to `GET /auth/kakao/callback?code=...`
5. Backend exchanges code for access token
6. Backend fetches user profile from Kakao API
7. Backend creates/finds user in database
8. Backend sets HTTP-only session cookie (JWT, 7 days)
9. Backend redirects user back to frontend
10. Frontend checks session status and updates auth state

---

## 🔐 Context APIs

### AuthContext

**File**: `/src/components/AuthContext.tsx`

Manages global authentication state.

**Interface**:

```tsx
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}
```

**Usage**:

```tsx
import { useAuth } from "./components/AuthContext";

function MyComponent() {
  const { isLoggedIn, user, login, logout } = useAuth();

  return (
    <div>
      {isLoggedIn ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={() => login(userData)}>Login</button>
      )}
    </div>
  );
}
```

**Storage**: Uses `localStorage` for persistence

---

### ThemeProvider

**File**: `/src/components/ThemeProvider.tsx`

Manages dark/light theme state.

**Interface**:

```tsx
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}
```

**Usage**:

```tsx
import { useTheme } from "./components/ThemeProvider";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>{theme === "dark" ? "🌙" : "☀️"}</button>
  );
}
```

**Implementation Details**:

- Adds/removes `.dark` class on `document.documentElement`
- Persists preference in `localStorage`
- Detects system preference on initial load

---

## 🛣 Routing

**File**: `/src/utils/routes.ts`

React Router v7 configuration using Data Mode.

**Route Structure**:

```tsx
import { createBrowserRouter, Navigate } from "react-router";
import Layout from "../components/Layout";
import ChatbotPage from "../components/ChatbotPage";
import MapPage from "../components/MapPage";
import WishlistPage from "../components/WishlistPage";
import VisitedPage from "../components/VisitedPage";
import MyPage from "../components/MyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/chatbot" replace />,
      },
      {
        path: "chatbot",
        element: <ChatbotPage />,
      },
      {
        path: "map",
        element: <MapPage />,
      },
      {
        path: "wishlist",
        element: <WishlistPage />,
      },
      {
        path: "visited",
        element: <VisitedPage />,
      },
      {
        path: "mypage",
        element: <MyPage />,
      },
    ],
  },
]);
```

**Routes**:
| Path | Component | Access |
|------|-----------|--------|
| `/` | Redirect to `/chatbot` | Public |
| `/chatbot` | ChatbotPage | Public |
| `/map` | MapPage | Public |
| `/wishlist` | WishlistPage | Protected |
| `/visited` | VisitedPage | Protected |
| `/mypage` | MyPage | Protected |

---

## 🎨 Styling System

### Tailwind CSS v4.0

**Configuration File**: `/src/styles/globals.css`

**Custom Color Tokens**:

```css
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --primary: #030213;
  --secondary: oklch(0.95 0.0058 264.53);
  --muted: #ececf0;
  --accent: #e9ebef;
  --destructive: #d4183d;
  --border: rgba(0, 0, 0, 0.1);
  /* ... more tokens */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode overrides */
}
```

**Usage in Components**:

```tsx
// Use Tailwind utility classes
<div className="bg-background text-foreground">
  <h1 className="text-amber-700 dark:text-amber-500">Bready for Suwon</h1>
</div>
```

**Brand Colors**:

- Primary Accent: `amber-500` / `amber-700`
- Background Light: `slate-50` / `white`
- Background Dark: `slate-900` / `slate-800`
- Text Light: `slate-600`
- Text Dark: `slate-300`

---

## 🔗 External Integrations

### 1. Kakao Map API

**Documentation**: https://apis.map.kakao.com/

**Setup**:

1. Get API key from Kakao Developers
2. Add to environment variables
3. Load script in `index.html`:

```html
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY"></script>
```

**Basic Usage**:

```tsx
useEffect(() => {
  const container = document.getElementById("map");
  const options = {
    center: new kakao.maps.LatLng(37.2636, 127.0286),
    level: 5,
  };
  const map = new kakao.maps.Map(container, options);
}, []);
```

---

### 2. Kakao Login API

**Documentation**: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api

**Authentication Method**: Kakao OAuth 2.0 with HTTP-only session cookies

**Setup**:

1. Create Kakao Developers App at https://developers.kakao.com
2. Configure OAuth redirect URI in Kakao console
3. Set up backend environment variables:
   - `KAKAO_CLIENT_ID`: Your Kakao app client ID
   - `KAKAO_CLIENT_SECRET`: Your Kakao app client secret
   - `KAKAO_REDIRECT_URI`: OAuth callback URL (e.g., `http://localhost:3000/auth/kakao/callback`)

**OAuth Flow**:

**Step 1: Initiate Login**

```tsx
// Frontend: Get OAuth authorize URL
const handleKakaoLogin = async () => {
  try {
    const response = await fetch("/auth/kakao/login", {
      credentials: "include", // Include cookies
    });
    const data = await response.json();

    // Redirect to Kakao OAuth page
    window.location.href = data.authorize_url;
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

**Step 2: Backend Callback Handling**

```tsx
// After user approves on Kakao, Kakao redirects to:
// GET /auth/kakao/callback?code=AUTHORIZATION_CODE

// Backend:
// 1. Exchanges code for access token
// 2. Fetches user profile from Kakao API
// 3. Creates/finds user in database
// 4. Generates JWT session token
// 5. Sets HTTP-only cookie
// 6. Redirects user back to frontend
```

**Step 3: Session Management**

```tsx
// Frontend: Check session status on app load
useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        login(userData);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  };

  checkSession();
}, []);
```

**Logout**:

```tsx
const handleLogout = async () => {
  try {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    logout(); // Clear frontend auth state
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
```

**Session Cookie Details**:

- Cookie name: `session`
- Type: JWT token
- Attributes: `HttpOnly`, `SameSite=lax`
- Max-Age: 7 days (604800 seconds)
- Secure: `true` (production only)

---

### 3. Vector DB for Chatbot

**Purpose**: Store and retrieve bakery information for AI chatbot

**Recommended Solutions**:

- Pinecone
- Weaviate
- Supabase Vector (pgvector)

**Data Structure**:

```json
{
  "id": "bakery_001",
  "name": "행복한 빵집",
  "description": "수원 화성 근처의 전통 빵집입니다...",
  "specialties": ["크루아상", "바게트"],
  "embedding": [0.123, -0.456, ...],
  "metadata": {
    "address": "수원시 팔달구...",
    "rating": 4.5,
    "category": ["프렌치", "브런치"]
  }
}
```

**Query API**:

```tsx
// Backend endpoint
POST /api/chatbot/query
{
  "message": "수원에서 크루아상이 맛있는 빵집 추천해줘",
  "topK": 3
}

// Response
{
  "response": "수원에서 크루아상이 맛있는 빵집으로는...",
  "sources": [
    {
      "bakeryId": "bakery_001",
      "name": "행복한 빵집",
      "relevanceScore": 0.92
    }
  ]
}
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd bready-for-suwon
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
touch .env
```

4. **Configure environment variables** (see below)

5. **Run development server**

```bash
npm run dev
```

6. **Build for production**

```bash
npm run build
```

7. **Preview production build**

```bash
npm run preview
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Kakao API Keys
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key
VITE_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key

# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api

# Vector DB (if using Pinecone)
VITE_PINECONE_API_KEY=your_pinecone_api_key
VITE_PINECONE_ENVIRONMENT=your_pinecone_environment
VITE_PINECONE_INDEX=bakery-index
```

**Security Note**: Never commit `.env` files to version control. Add to `.gitignore`:

```
.env
.env.local
.env.production
```

---

## 🧪 API Endpoints (Backend Required)

### Authentication

**Login with Kakao OAuth**

```
GET /auth/kakao/login
Description: Returns the Kakao OAuth authorize URL for the frontend to redirect users to.

Response:
{
  "authorize_url": "https://kauth.kakao.com/oauth/authorize?client_id=...&redirect_uri=...&response_type=code"
}
```

**Kakao OAuth Callback**

```
GET /auth/kakao/callback
Query Parameters:
  - code (string, required): Authorization code from Kakao

Description:
  - Exchanges authorization code for access token
  - Fetches user profile from Kakao API
  - Creates/finds user in database
  - Sets HTTP-only session cookie
  - Redirects to frontend URL

Response: Redirects to frontend with session cookie set

Cookie:
  - Name: session
  - Value: JWT token
  - HttpOnly: true
  - SameSite: lax
  - Max-Age: 604800 (7 days)
  - Secure: true (production only)
```

**Logout**

```
POST /auth/logout
Description: Clears the session cookie to log out the user.

Response:
{
  "ok": true
}
```

**Check Session**

```
GET /api/auth/session
Headers: Cookie: session=<jwt_token>
Description: Verifies session cookie and returns current user data.

Response (authenticated):
{
  "id": "user_123",
  "name": "홍길동",
  "email": "user@example.com",
  "profileImage": "https://...",
  "kakaoId": "kakao_id"
}

Response (unauthenticated):
Status: 401 Unauthorized
```

---

### Chatbot

```
POST /api/chatbot/query
Body: { message: string, userId?: string }
Response: { response: string, relatedBakeries?: Bakery[] }
```

---

### Bakeries

```
GET /api/bakeries
Query: ?category=bread&rating=4.5&distance=5km
Response: { bakeries: Bakery[] }

GET /api/bakeries/:id
Response: { bakery: Bakery }
```

---

### Wishlist

```
GET /api/wishlist
Headers: { Authorization: Bearer <token> }
Response: { bakeries: Bakery[] }

POST /api/wishlist/:bakeryId
Headers: { Authorization: Bearer <token> }
Response: { success: boolean }

DELETE /api/wishlist/:bakeryId
Headers: { Authorization: Bearer <token> }
Response: { success: boolean }
```

---

### Visit History

```
GET /api/visits
Headers: { Authorization: Bearer <token> }
Response: { visits: VisitRecord[] }

POST /api/visits
Headers: { Authorization: Bearer <token> }
Body: { bakeryId: string, rating?: number, review?: string }
Response: { visit: VisitRecord }

PUT /api/visits/:id
Headers: { Authorization: Bearer <token> }
Body: { rating?: number, review?: string }
Response: { visit: VisitRecord }
```

---

### User Profile

```
GET /api/user/profile
Headers: { Authorization: Bearer <token> }
Response: { user: UserProfile }

PUT /api/user/profile
Headers: { Authorization: Bearer <token> }
Body: { name?: string, profileImage?: string }
Response: { user: UserProfile }
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
Default: 320px - 767px (Mobile)
md: 768px+  (Tablet)
lg: 1024px+ (Desktop)
xl: 1280px+ (Large Desktop)
```

**Usage Examples**:

```tsx
// Hidden on mobile, visible on desktop
<p className="hidden lg:block">Always be ready with Bready!</p>

// Responsive padding
<div className="px-4 md:px-8">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🐛 Common Issues & Solutions

### Issue: Styles not loading

**Solution**: Ensure `globals.css` is imported in `main.tsx`

### Issue: Kakao Map not displaying

**Solution**:

1. Check API key in `.env`
2. Verify script tag in `index.html`
3. Check browser console for errors

### Issue: Dark mode not working

**Solution**: Verify ThemeProvider wraps entire app in `App.tsx`

### Issue: Protected routes accessible without login

**Solution**: Add route guards in components:

```tsx
const { isLoggedIn } = useAuth();
if (!isLoggedIn) return <LoginPrompt />;
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [React Router v7 Docs](https://reactrouter.com/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Kakao Developers](https://developers.kakao.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 📄 License

[Add your license information here]

---

## 👥 Contributors

[Add contributor information here]

---

**Last Updated**: December 2, 2025
**Version**: 1.0.0
