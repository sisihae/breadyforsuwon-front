import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! 수원 빵집 추천 챗봇입니다. 어떤 빵집을 찾으시나요? 예를 들어 '크루아상 맛집' 또는 '행궁동 근처 베이커리'처럼 물어보세요!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  // Mock chatbot responses
  const mockResponses = [
    "수원에는 정말 좋은 빵집들이 많아요! 행궁동의 '르뱅드마리'는 천연발효빵으로 유명하고, 크루아상이 특히 맛있습니다.",
    "영통구에 있는 '베이커리카페 밀'을 추천드려요. 소금빵과 카눌레가 시그니처 메뉴이고, 아침 일찍 가시는 걸 추천합니다!",
    "팔달구 '빵굽는날'은 단팥빵과 크림빵이 맛있기로 유명해요. 오후 3시쯤 가면 갓 구운 빵을 만나실 수 있어요.",
    "화성행궁 근처 '수제빵공방 온'은 분위기 좋은 카페형 베이커리입니다. 말차크림빵과 소보로빵을 꼭 드셔보세요!",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const randomResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="text-slate-900">AI 챗봇</h2>
        <p className="text-slate-600">원하는 빵집을 물어보세요</p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
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
                      : "bg-slate-200"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-slate-700" />
                  )}
                </div>
                <div
                  className={`max-w-2xl rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      message.role === "user"
                        ? "text-amber-100"
                        : "text-slate-500"
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

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="빵집에 대해 물어보세요... (예: 크루아상 맛집 추천해줘)"
              className="flex-1"
            />
            <Button onClick={handleSend} className="bg-amber-500 hover:bg-amber-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            * 실제 서비스에서는 Vector DB를 활용한 AI 추천이 제공됩니다
          </p>
        </div>
      </Card>
    </div>
  );
}
