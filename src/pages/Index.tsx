import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import AuthScreen from '@/components/AuthScreen';

const Index = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const handleAuth = (userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setSelectedChatId(null);
  };

  if (!user || !token) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'chats' ? (
        <>
          <div className="w-80">
            <ChatList 
              onSelectChat={setSelectedChatId} 
              selectedChatId={selectedChatId}
              userId={user.id}
            />
          </div>
          <ChatWindow chatId={selectedChatId} userId={user.id} />
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
              {activeTab === 'profile' && user.name}
              {activeTab === 'settings' && 'Настройки'}
            </h2>
            {activeTab === 'profile' && (
              <div className="space-y-2">
                <p className="text-muted-foreground">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Выйти
                </button>
              </div>
            )}
            {activeTab !== 'profile' && (
              <p className="text-muted-foreground">Раздел в разработке</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;