import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Chat {
  id: number;
  name: string;
  is_group: boolean;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

interface ChatListProps {
  onSelectChat: (chatId: number) => void;
  selectedChatId: number | null;
  userId: number;
}

export default function ChatList({ onSelectChat, selectedChatId, userId }: ChatListProps) {
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    loadChats();
  }, [userId]);

  const loadChats = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/fb0ecc65-450c-4c07-b67f-c80398d71fbf', {
        headers: {
          'X-User-Id': userId.toString(),
        },
      });

      const data = await response.json();
      if (response.ok) {
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Поиск чатов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-none"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-2 opacity-50" />
              <p>Нет чатов</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-muted' : ''
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      {chat.name ? chat.name.substring(0, 2).toUpperCase() : chat.is_group ? 'ГР' : 'ЧТ'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {chat.name || `Чат #${chat.id}`}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.last_message_time)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.last_message || 'Нет сообщений'}
                  </p>
                </div>

                {chat.unread_count > 0 && (
                  <Badge className="bg-gradient-to-r from-primary to-secondary border-none">
                    {chat.unread_count}
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
