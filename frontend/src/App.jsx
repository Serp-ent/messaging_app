import { useState, useEffect, useRef, createContext, useContext } from 'react';
import styles from './App.module.css';
import SidebarRight from './SidebarRight';
import SidebarLeft from './SidebarLeft';
import { useAuth } from './AuthContext';
import Header from './Header';
import { Outlet, useNavigate } from 'react-router-dom';

const ConversationContext = createContext();

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleActiveSidebar = () => {
    setActiveSidebar(activeSidebar === 'conversations' ? 'users' : 'conversations');
  };

  const handleLoadConversation = async (id) => {
    navigate('/');
    if (selectedConversation === id) {
      return;
    }

    setSelectedConversation(id);
  };

  return (
    <>
      <Header />
      <div className={styles.mainContainer}>
        {/* Left Sidebar: Conversations and Users */}
        {(!loadingAuth && user) && (
          <>
            <aside className={`${styles.sidebarLeft} ${isMenuOpen ? styles.open : ''}`}>
              <button className={styles.switchSidebarButton} onClick={toggleActiveSidebar}>
                {activeSidebar === 'users' ? 'Users' : 'Conversations'}
              </button>

              {activeSidebar === 'conversations' ? (
                <SidebarLeft
                  selectedConversation={selectedConversation}
                  onConversationSelect={handleLoadConversation} />
              ) : null}

              {activeSidebar === 'users' ? (
                <SidebarRight onConversationSelect={handleLoadConversation} />
              ) : null}
            </aside>
          </>
        )}

        <main className={styles.main}>
          <ConversationContext.Provider value={{
            selectedConversation,
          }}>
            <Outlet />
          </ConversationContext.Provider>
        </main>

        {/* Menu Button for narrow screens */}
        {(!loadingAuth && user) && (
          <button className={styles.menuButton} onClick={toggleMenu}>
            &#9776;
          </button>
        )}
        {(!loadingAuth && user && isMenuOpen) && <div className={styles.overlay} onClick={toggleMenu}></div>}
      </div>
    </>
  );
}

export const useConversationContext = () => useContext(ConversationContext);