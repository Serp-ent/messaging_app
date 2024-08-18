import { useState, useEffect } from 'react';
import styles from './Home.module.css';
import SidebarRight from './SidebarRight';
import SidebarLeft from './SidebarLeft';

async function fetchMessages(conversationId, page = 1, limit = 20) {
  const authToken = localStorage.getItem('authToken');

  try {
    const response = await fetch(`http://localhost:3000/api/conversations/${conversationId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}


export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const limit = 20;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleActiveSidebar = () => {
    setActiveSidebar(activeSidebar === 'conversations' ? 'users' : 'conversations');
  };

  const loadMessages = async (conversationId, page = 1) => {
    const newMessages = await fetchMessages(conversationId, page, limit);
    if (newMessages.length === 0) {
      setHasMoreMessages(false);
    } else {
      // Reverse the new messages before prepending to ensure the newest are at the bottom
      setMessages([...messages, ...newMessages.reverse()]);
    }
  };

  const handleLoadConversation = async (id) => {
    setSelectedConversation(id);
    setMessages([]);
    setPage(1);
    setHasMoreMessages(true);
    await loadMessages(id, 1);
  };

  const handleScroll = async (e) => {
    if (e.target.scrollTop === 0 && hasMoreMessages) {
      const nextPage = page + 1;
      await loadMessages(selectedConversation, nextPage);
      setPage(nextPage);
    }
  };

  console.log('messages:', messages);

  return (
    <div className={styles.mainContainer}>
      {/* Left Sidebar: Conversations and Users */}
      <aside className={`${styles.sidebarLeft} ${isMenuOpen ? styles.open : ''}`}>
        <button className={styles.switchSidebarButton} onClick={toggleActiveSidebar}>
          Switch to {activeSidebar === 'conversations' ? 'Users' : 'Conversations'}
        </button>

        {(activeSidebar === 'conversations') ? (
          <SidebarLeft onConversationSelect={handleLoadConversation} />
        ) : null}

        {activeSidebar === 'users' ? (
          <SidebarRight />
        ) : null}

      </aside>

      <main className={styles.main} onScroll={handleScroll}>
        {messages.map((message) => (
          <div key={message.id} className={styles.messageBubble}>
            <span className={styles.sender}>{message.sender.firstName} {message.sender.lastName}</span>
            <p>{message.content}</p>
            <time dateTime={message.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</time>
          </div>
        ))}
        {!selectedConversation && <div>Select a conversation to view messages</div>}
      </main>

      {/* Menu Button for narrow screens */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        &#9776;
      </button>
      {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}
    </div>
  );
}