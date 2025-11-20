import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  text: string;
  time: string;
  isMine: boolean;
}

const mockMessages: Message[] = [
  { id: 1, text: 'Привет! Как дела?', time: '14:30', isMine: false },
  { id: 2, text: 'Привет! Все отлично, работаю над новым проектом', time: '14:31', isMine: true },
  { id: 3, text: 'Звучит интересно! Расскажешь подробнее?', time: '14:32', isMine: false },
];

interface ChatWindowProps {
  chatId: number | null;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      text: newMessage,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
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

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-4 border-b border-border flex items-center gap-3 bg-card/50 backdrop-blur-sm">
        <Avatar>
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            АС
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">Анна Смирнова</h3>
          <p className="text-xs text-muted-foreground">В сети</p>
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 animate-fade-in ${message.isMine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!message.isMine && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
                    АС
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${message.isMine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    message.isMine
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{message.time}</span>
              </div>
            </div>
          ))}
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
          />
          <Button
            onClick={handleSend}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
