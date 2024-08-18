import { useState, useEffect } from 'react';
import styles from './Home.module.css';
import SidebarRight from './SidebarRight';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState('conversations');
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleActiveSidebar = () => {
    setActiveSidebar(activeSidebar === 'conversations' ? 'users' : 'conversations');
  };

  return (
    <div className={styles.mainContainer}>
      {/* Left Sidebar: Conversations and Users */}
      <aside className={`${styles.sidebarLeft} ${isMenuOpen ? styles.open : ''}`}>
        {(!isWideScreen && activeSidebar === 'conversations') || isWideScreen ? (
          <ul className={styles.conversationList}>
            <li className={styles.conversation}>
              <div className={styles.userInfo}>
                <div className={styles.conversationAvatar}></div>
                <div>Name Surname</div>
              </div>
              <div>Last message</div>
            </li>
            <li className={styles.conversation}>
              <div className={styles.userInfo}>
                <div className={styles.conversationAvatar}></div>
                <div>Name Surname</div>
              </div>
              <div>Last message</div>
            </li>
          </ul>
        ) : null}

        {!isWideScreen && activeSidebar === 'users' ? (
          <ul className={styles.userList}>
            <li className={styles.user}>
              <div className={styles.userItem}>
                <div className={styles.userAvatar}></div>
                <div>User Name</div>
              </div>
            </li>
            <li className={styles.user}>
              <div className={styles.userItem}>
                <div className={styles.userAvatar}></div>
                <div>User Name</div>
              </div>
            </li>
          </ul>
        ) : null}

        {/* Button to switch between Conversations and Users (Only on medium and small screens) */}
        {!isWideScreen && (
          <button className={styles.switchSidebarButton} onClick={toggleActiveSidebar}>
            Switch to {activeSidebar === 'conversations' ? 'Users' : 'Conversations'}
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.messageBubble}>
          <span className={styles.sender}>Sender Name</span>
          <p>This is the content of the message.</p>
          <time dateTime="2024-08-16T12:34">12:34 PM</time>
        </div>
        <div className={styles.messageBubble}>
          <span className={styles.sender}>Sender Name</span>
          <p>This is another message content.</p>
          <time dateTime="2024-08-16T12:35">12:35 PM</time>
        </div>
      </main>

      {/* Right Sidebar: Users (Always visible on wide screens) */}
      {isWideScreen && <SidebarRight />}

      {/* Menu Button for narrow screens */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        &#9776;
      </button>
      {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}
    </div>
  );
}