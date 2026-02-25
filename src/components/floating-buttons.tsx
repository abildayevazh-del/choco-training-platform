import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";

interface ChatMessage {
  text: string;
  isUser: boolean;
}

export function FloatingButtons() {
  const { t, language } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { text: t.greeting, isUser: false },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevLangRef = useRef(language);

  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      setChatMessages([{ text: t.greeting, isUser: false }]);
    }
  }, [language, t.greeting]);

  const whatsappNumber = "77082925746";
  const whatsappMessage = encodeURIComponent("Здравствуйте! Нужна помощь с Choco Smart Restaurant");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessageText = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;
    
    setChatMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setMessage("");
    setIsLoading(true);
    
    try {
      const currentMessages = [...chatMessages, { text: userMessage, isUser: true }];
      const historyForApi = currentMessages.slice(1);
      const response = await apiRequest("POST", "/api/ai/chat", { message: userMessage, history: historyForApi });
      const data = await response.json();
      
      setChatMessages((prev) => [
        ...prev,
        { text: data.reply || t.generalError, isUser: false },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { text: t.connectionError, isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    await sendMessageText(message.trim());
  };

  const isChoiceList = (text: string): boolean => {
    const choiceMarkers = [
      "Выберите:", "Выберите тему:", "Что именно", "интересует",
      "Таңдаңыз:", "Нұсқаны таңдаңыз", "не білгіңіз келеді",
    ];
    const hasChoiceMarker = choiceMarkers.some(marker => text.includes(marker));
    if (!hasChoiceMarker) return false;
    const lines = text.split('\n').filter(l => l.trim());
    const numberedLines = lines.filter(l => l.trim().match(/^\d+\.\s/));
    return numberedLines.length >= 2;
  };

  const formatMessage = (text: string) => {
    const renderLineWithLinks = (line: string, lineIndex: number) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts: JSX.Element[] = [];
      let lastIndex = 0;
      let match;
      let partIndex = 0;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={`${lineIndex}-text-${partIndex++}`}>{line.slice(lastIndex, match.index)}</span>);
        }
        const [, linkText, linkUrl] = match;
        if (linkUrl.startsWith('tel:')) {
          parts.push(
            <a 
              key={`${lineIndex}-link-${partIndex++}`}
              href={linkUrl}
              className="text-primary underline font-medium"
              data-testid="link-support-phone"
            >
              {linkText}
            </a>
          );
        } else if (linkUrl.startsWith('/')) {
          parts.push(
            <a 
              key={`${lineIndex}-link-${partIndex++}`}
              href={linkUrl}
              className="text-primary underline font-medium"
              data-testid="link-knowledge-base"
            >
              {linkText}
            </a>
          );
        } else {
          parts.push(
            <a 
              key={`${lineIndex}-link-${partIndex++}`}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline font-medium"
            >
              {linkText}
            </a>
          );
        }
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(<span key={`${lineIndex}-text-${partIndex++}`}>{line.slice(lastIndex)}</span>);
      }

      return parts.length > 0 ? parts : line;
    };

    const hasChoices = isChoiceList(text);

    return text.split('\n').map((line, i) => {
      const content = renderLineWithLinks(line, i);
      const numberedMatch = line.trim().match(/^(\d+)\.\s+(.+)/);

      if (hasChoices && numberedMatch) {
        const optionText = numberedMatch[2].trim();
        return (
          <span key={i}>
            <button
              type="button"
              onClick={() => sendMessageText(optionText)}
              disabled={isLoading}
              className="block w-full text-left pl-2 py-1.5 my-0.5 rounded-md text-primary cursor-pointer hover:bg-primary/10 active:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid={`button-option-${numberedMatch[1]}`}
            >
              {numberedMatch[1]}. {optionText}
            </button>
          </span>
        );
      }
      
      return (
        <span key={i}>
          {line.startsWith('**') && line.endsWith('**') ? (
            <strong>{line.replace(/\*\*/g, '')}</strong>
          ) : line.startsWith('–') || line.startsWith('-') ? (
            <span className="block pl-2">{content}</span>
          ) : line.match(/^\d+\./) ? (
            <span className="block pl-2">{content}</span>
          ) : line === '---' ? (
            <hr className="my-2 border-border" />
          ) : (
            content
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-50">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform touch-manipulation"
          data-testid="button-whatsapp"
        >
          <SiWhatsapp className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
        </a>
        
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform touch-manipulation"
          data-testid="button-ai-chat"
        >
          {isChatOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          )}
        </button>
      </div>

      {isChatOpen && (
        <Card className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-96 shadow-xl z-50 border" data-testid="chat-widget">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">{t.aiConsultant}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? t.typing : t.online}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72">
              <div className="p-4 space-y-3" data-testid="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                        msg.isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                      data-testid={`chat-message-${index}`}
                    >
                      {msg.isUser ? msg.text : formatMessage(msg.text)}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-3 border-t flex gap-2">
              <Input
                placeholder={t.describeProblem}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="flex-1 min-h-[44px]"
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="min-h-[44px] min-w-[44px] touch-manipulation"
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
