import { useState, useEffect, useRef } from 'react';
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
  const [showScrollButton, setShowScrollButton] = useState(false); // State to control the scroll button visibility
  const limit = 10;

  // Refs for scrolling
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); // Ref to the messages container for precise scroll control

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation) {
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
      setMessages(prevMessages => [...prevMessages, result.message]);
      setMessageContent(''); // Clear the input after sending

      // Scroll to the new message
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    // Scroll to the latest message whenever messages change (new message sent)
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      // Calculate the scroll height before new messages are added
      const scrollHeightBefore = messagesContainerRef.current.scrollHeight;

      // Reverse and prepend the new messages
      newMessages.reverse();
      setMessages((prevMessages) => [...newMessages, ...prevMessages]);

      // Calculate the difference in scroll height after messages are added
      setTimeout(() => {
        const scrollHeightAfter = messagesContainerRef.current.scrollHeight;
        const scrollDifference = scrollHeightAfter - scrollHeightBefore;

        // Adjust the scroll position to maintain the user's position
        messagesContainerRef.current.scrollTop += scrollDifference;
      }, 0);
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

    // After loading the messages, scroll to the bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 0);
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMoreMessages) {
      const nextPage = page + 1;
      loadMessages(selectedConversation, nextPage);
      setPage(nextPage);
    }

    // Show or hide the scroll button based on the scroll position
    if (e.target.scrollHeight - e.target.scrollTop > e.target.clientHeight + 100) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <div
          className={styles.messages}
          onScroll={handleScroll}
          ref={messagesContainerRef} // Attach the ref to the messages container
        >
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
          {/* Dummy div to mark the end of the messages for scrolling */}
          <div ref={messagesEndRef} />
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
        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button className={styles.scrollButton} onClick={scrollToBottom}>
            Scroll to Bottom
          </button>
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