import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
  { id: 'contacts', icon: 'Users', label: 'Контакты' },
  { id: 'groups', icon: 'UsersRound', label: 'Группы' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
  { id: 'settings', icon: 'Settings', label: 'Настройки' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-20 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
          <Icon name="MessageSquare" size={24} className="text-primary-foreground" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="icon"
            onClick={() => onTabChange(tab.id)}
            className={`w-12 h-12 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground hover:opacity-90'
                : 'hover:bg-muted'
            }`}
            title={tab.label}
          >
            <Icon name={tab.icon as any} size={22} />
          </Button>
        ))}
      </div>

      <Avatar className="w-12 h-12 cursor-pointer hover:ring-2 ring-primary transition-all">
        <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-primary-foreground">
          Вы
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
