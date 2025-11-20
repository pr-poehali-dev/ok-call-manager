import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  text: string;
  created_at: string;
  user_id: number;
  user_name?: string;
}

interface ChatWindowProps {
  chatId: number | null;
  userId: number;
}

export default function ChatWindow({ chatId, userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [chatId]);

  const loadMessages = async () => {
    if (!chatId) return;

    try {
      const response = await fetch(
        `https://functions.poehali.dev/fb0ecc65-450c-4c07-b67f-c80398d71fbf?chat_id=${chatId}`,
        {
          headers: {
            'X-User-Id': userId.toString(),
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId) return;

    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/fb0ecc65-450c-4c07-b67f-c80398d71fbf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({
          action: 'send_message',
          chat_id: chatId,
          text: newMessage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
            <Icon name="MessageCircle" size={40} className="text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Выберите чат</h2>
          <p className="text-muted-foreground">Начните общение с друзьями и коллегами</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-4 border-b border-border flex items-center gap-3 bg-card/50 backdrop-blur-sm">
        <Avatar>
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            ЧТ
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">Чат #{chatId}</h3>
          <p className="text-xs text-muted-foreground">Активен</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Icon name="Phone" size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Icon name="Video" size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Icon name="MoreVertical" size={20} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => {
            const isMine = message.user_id === userId;
            return (
              <div
                key={message.id}
                className={`flex gap-2 animate-fade-in ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMine && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
                      {message.user_name?.substring(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-md px-4 py-2 rounded-2xl ${
                      isMine
                        ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Icon name="Paperclip" size={20} />
          </Button>
          <Input
            type="text"
            placeholder="Написать сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-muted/50 border-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            disabled={isLoading}
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
