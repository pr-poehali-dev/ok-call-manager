import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Chat {
  id: number;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const mockChats: Chat[] = [
  { id: 1, name: 'Анна Смирнова', lastMessage: 'Привет! Как дела?', time: '14:32', unread: 2, online: true },
  { id: 2, name: 'Команда дизайнеров', lastMessage: 'Илья: Отправил макеты', time: '13:15', unread: 5, online: false },
  { id: 3, name: 'Максим Петров', lastMessage: 'Созвонимся завтра?', time: '12:08', unread: 0, online: true },
  { id: 4, name: 'Мария Иванова', lastMessage: 'Спасибо за помощь!', time: 'Вчера', unread: 0, online: false },
  { id: 5, name: 'Проект Alpha', lastMessage: 'Вы: Отлично, принято', time: 'Вчера', unread: 0, online: false },
];

interface ChatListProps {
  onSelectChat: (chatId: number) => void;
  selectedChatId: number | null;
}

export default function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const [search, setSearch] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

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
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                selectedChatId === chat.id ? 'bg-muted' : ''
              }`}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {chat.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>

              {chat.unread > 0 && (
                <Badge className="bg-gradient-to-r from-primary to-secondary border-none">
                  {chat.unread}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
