import { apiFetch } from "./api";

// ==================== Types ====================

export interface Bakery {
  id: string;
  name: string;
  address: string;
  district?: string;
  rating: number;
  bread_tags?: string[];
  ai_summary?: string;
  latitude?: number;
  longitude?: number;
}

export interface BreadTag {
  id: string;
  name: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  bakery_id: string;
  bakery_name: string;
  bakery_address: string;
  bread_types: string[];
  note: string | null;
  visited: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitRecord {
  id: string;
  user_id: string;
  bakery_id: string;
  bakery_name: string;
  bakery_address: string;
  visit_date: string;
  rating: number;
  bread_purchased: string | null;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryItem {
  id: string;
  user_message: string;
  bot_response: string;
  metadata_json: {
    sources?: string[];
    bread_tags?: string[];
    bakery_ids?: string[];
  };
  created_at: string;
}

export interface ChatResponse {
  response: string;
  recommendations: Array<{
    id: string;
    name: string;
    address: string;
    district: string;
    rating: number;
    bread_tags: string[];
    similarity_score: number;
    relevance_reason: string;
  }>;
  sources_used: string[];
}

// ==================== Bakery APIs ====================

export const bakeryAPI = {
  /**
   * Get all bakeries with optional filters
   */
  getAll: async (params?: {
    district?: string;
    rating?: number;
    limit?: number;
  }): Promise<Bakery[]> => {
    const queryParams = new URLSearchParams();
    if (params?.district) queryParams.append("district", params.district);
    if (params?.rating) queryParams.append("rating", params.rating.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return apiFetch(`/bakeries${query ? `?${query}` : ""}`);
  },

  /**
   * Get a specific bakery by ID
   */
  getById: async (bakeryId: string): Promise<Bakery> => {
    return apiFetch(`/bakeries/${bakeryId}`);
  },

  /**
   * Search bakeries by name or tag
   */
  search: async (params: {
    name?: string;
    tag?: string;
    limit?: number;
  }): Promise<Bakery[]> => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append("name", params.name);
    if (params.tag) queryParams.append("tag", params.tag);
    if (params.limit) queryParams.append("limit", params.limit.toString());

    return apiFetch(`/bakeries/search?${queryParams.toString()}`);
  },
};

// ==================== Bread Tags APIs ====================

export const tagsAPI = {
  /**
   * Get all bread tags
   */
  getAll: async (): Promise<BreadTag[]> => {
    return apiFetch("/tags");
  },

  /**
   * Get bakeries by tag name
   */
  getBakeries: async (tagName: string): Promise<Bakery[]> => {
    return apiFetch(`/tags/${encodeURIComponent(tagName)}/bakeries`);
  },
};

// ==================== Chat APIs ====================

export const chatAPI = {
  /**
   * Send a chat message to the RAG bot
   */
  sendMessage: async (params: {
    message: string;
    context_count?: number;
  }): Promise<ChatResponse> => {
    return apiFetch("/chat", {
      method: "POST",
      body: JSON.stringify({
        message: params.message,
        context_count: params.context_count || 5,
      }),
    });
  },

  /**
   * Get chat history
   */
  getHistory: async (limit?: number): Promise<ChatHistoryItem[]> => {
    const query = limit ? `?limit=${limit}` : "";
    return apiFetch(`/chat/history${query}`);
  },

  /**
   * Get a specific chat history item by ID
   */
  getHistoryById: async (id: string): Promise<ChatHistoryItem> => {
    return apiFetch(`/chat/history/${id}`);
  },

  /**
   * Delete a chat history item
   */
  deleteHistory: async (id: string): Promise<void> => {
    return apiFetch(`/chat/history/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== Wishlist APIs ====================

export const wishlistAPI = {
  /**
   * Get all wishlist items for current user
   */
  getAll: async (): Promise<WishlistItem[]> => {
    return apiFetch("/wishlist");
  },

  /**
   * Add a bakery to wishlist
   */
  add: async (bakeryId: string): Promise<WishlistItem> => {
    return apiFetch("/wishlist", {
      method: "POST",
      body: JSON.stringify({ bakery_id: bakeryId }),
    });
  },

  /**
   * Update a wishlist item
   */
  update: async (
    itemId: string,
    data: { note?: string; visited?: boolean }
  ): Promise<WishlistItem> => {
    return apiFetch(`/wishlist/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a wishlist item
   */
  delete: async (itemId: string): Promise<{ ok: boolean }> => {
    return apiFetch(`/wishlist/${itemId}`, {
      method: "DELETE",
    });
  },
};

// ==================== Visit Records APIs ====================

export const visitRecordsAPI = {
  /**
   * Get all visit records for current user
   */
  getAll: async (): Promise<VisitRecord[]> => {
    return apiFetch("/visit-records");
  },

  /**
   * Create a new visit record
   */
  create: async (data: {
    bakery_id?: string;
    bakery_name?: string;
    visit_date: string;
    rating: number;
    bread_purchased?: string;
    review?: string;
  }): Promise<VisitRecord> => {
    return apiFetch("/visit-records", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a visit record
   */
  update: async (
    recordId: string,
    data: {
      visit_date?: string;
      rating?: number;
      bread_purchased?: string;
      review?: string;
    }
  ): Promise<VisitRecord> => {
    return apiFetch(`/visit-records/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a visit record
   */
  delete: async (recordId: string): Promise<{ ok: boolean }> => {
    return apiFetch(`/visit-records/${recordId}`, {
      method: "DELETE",
    });
  },
};
