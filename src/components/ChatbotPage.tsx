import { useState, useEffect } from "react";
import { Send, Bot, User, Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { chatAPI, ChatHistoryItem } from "../utils/api-service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요! 수원 빵집 추천 챗봇입니다. 어떤 빵집을 찾으시나요? 예를 들어 '크루아상 맛집' 또는 '행궁동 근처 베이커리'처럼 물어보세요!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await chatAPI.getHistory(100);
      const formattedHistory: ChatHistory[] = history.map((item) => ({
        id: item.id,
        title:
          item.user_message.substring(0, 20) +
          (item.user_message.length > 20 ? "..." : ""),
        lastMessage:
          item.bot_response.substring(0, 50) +
          (item.bot_response.length > 50 ? "..." : ""),
        timestamp: new Date(item.created_at),
      }));
      setChatHistories(formattedHistory);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setIsSending(true);

    try {
      const data = await chatAPI.sendMessage({
        message: messageText,
        context_count: 5,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data?.response || "죄송합니다. 답변을 생성할 수 없습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Reload chat history to include the new chat
      await loadChatHistory();
    } catch (err: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: err?.body?.detail || "서버와 통신 중 오류가 발생했습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "안녕하세요! 수원 빵집을 추천해드리는 Bready입니다. 어떤 빵집을 찾으시나요? 예를 들어 '비건 디저트 맛집' 또는 '분위기 좋은 베이커리카페'처럼 물어보세요!",
        timestamp: new Date(),
      },
    ]);
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteHistory(id);
      setChatHistories((prev) => prev.filter((chat) => chat.id !== id));
      if (selectedChatId === id && chatHistories.length > 1) {
        const remainingChats = chatHistories.filter((chat) => chat.id !== id);
        setSelectedChatId(remainingChats[0]?.id || null);
      }
    } catch (error) {
      console.error("Failed to delete chat history:", error);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Chat History Sidebar */}
      <Card className="flex w-80 flex-col overflow-hidden dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b p-4 dark:border-slate-700">
          <Button
            onClick={handleNewChat}
            className="w-full gap-2 bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />새 채팅 시작
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {chatHistories.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`group relative cursor-pointer rounded-lg p-3 transition-colors ${
                  selectedChatId === chat.id
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="flex-1 overflow-hidden">
                    <h4
                      className={`truncate text-sm ${
                        selectedChatId === chat.id
                          ? "text-amber-700 dark:text-amber-500"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {chat.title}
                    </h4>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {chat.lastMessage}
                    </p>
                    <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {chat.timestamp.toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) =>
                      handleDeleteChat(chat.id, e)
                    }
                    className="invisible h-6 w-6 p-0 text-slate-400 hover:text-red-500 group-hover:visible dark:text-slate-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="mb-4">
          <h2 className="text-slate-900 dark:text-slate-100">AI 챗봇</h2>
          <p className="text-slate-600 dark:text-slate-400">
            원하는 빵집을 물어보세요
          </p>
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden dark:border-slate-700 dark:bg-slate-800">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.role === "user"
                        ? "bg-amber-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    )}
                  </div>
                  <div
                    className={`max-w-2xl rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        message.role === "user"
                          ? "text-amber-100"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-4 dark:border-slate-700">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="빵집에 대해 물어보세요... (예: 크루아상 맛집 추천해줘)"
                className="flex-1 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              <Button
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              * Bready can make mistakes. Please verify the information.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
