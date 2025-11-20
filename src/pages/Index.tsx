import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';

const Index = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'chats' ? (
        <>
          <div className="w-80">
            <ChatList onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
          </div>
          <ChatWindow chatId={selectedChatId} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold">
              {activeTab === 'contacts' && 'Контакты'}
              {activeTab === 'groups' && 'Группы'}
              {activeTab === 'profile' && 'Профиль'}
              {activeTab === 'settings' && 'Настройки'}
            </h2>
            <p className="text-muted-foreground">Раздел в разработке</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
