import { useState, useEffect } from 'react';
import styles from './Home.module.css';
import SidebarRight from './SidebarRight';
import SidebarLeft from './SidebarLeft';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const limit = 10;

  const sendMessage = async () => {
    if (!messageContent.trim() || !setSelectedConversation) {
      return;
    }

    const authToken = localStorage.getItem('authToken');
    try {
      const response = await fetch(`http://localhost:3000/api/conversations/${selectedConversation}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content: messageContent })
      });

      if (!response.ok) {
        console.error(response);
        return;
      }

      const result = await response.json();
      // Update messages state with the new message
      setMessages(prevMessages => [...prevMessages, result.message]);
      setMessageContent(''); // Clear the input after sending
    } catch (err) {
      console.log(err);
    }
  }

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
      // console.log('newMessages:', newMessages.reverse());
      newMessages.reverse();
      setMessages((prevMessages) => [...newMessages, ...prevMessages]);
    }
  };

  const handleLoadConversation = async (id) => {
    if (selectedConversation === id) {
      return;
    }

    setSelectedConversation(id);
    setMessages([]);
    setPage(1);
    setHasMoreMessages(true);
    await loadMessages(id, 1);
  };

  const handleScroll = async (e) => {
    console.log('Scrolled:', e.target.scrollTop);
    if (e.target.scrollTop === 0 && hasMoreMessages) {
      const nextPage = page + 1;
      await loadMessages(selectedConversation, nextPage);
      setPage(nextPage);
    }
  };

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

      <main className={styles.main}>
        <div className={styles.messages} onScroll={handleScroll}>
          {!selectedConversation && <div>Select a conversation to view messages</div>}
          {messages.map((message) => (
            <div key={message.id}
              className={`${styles.messageBubble} ${(message.senderId === user.id) ? styles.messageSend : styles.messageReceived}`}>
              <div>
                <time dateTime={message.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</time>
                <div className={styles.sender}>{message.sender.firstName} {message.sender.lastName}</div>
                <p>{message.content}</p>
              </div>
            </div>
          ))}

        </div>
        {selectedConversation && (
          <div className={styles.messageInput}>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder='Send a message'
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        )}
      </main>

      {/* Menu Button for narrow screens */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        &#9776;
      </button>
      {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}
    </div>
  );
}