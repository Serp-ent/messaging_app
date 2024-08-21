import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useConversationContext } from './App';
import styles from './Conversation.module.css'
import { useEffect, useRef, useState } from 'react';

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


export default function Conversation() {
  const { user } = useAuth();
  const { selectedConversation } = useConversationContext();

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false); // State to control the scroll button visibility

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (selectedConversation) {
      setMessages([]);
      setPage(1);
      setHasMoreMessages(true);
      loadMessages(selectedConversation, 1);
    }
  }, [selectedConversation])

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages])

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

  useEffect(() => {
    // Scroll to the latest message whenever messages change (new message sent)
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = async (conversationId, page = 1) => {
    const newMessages = await fetchMessages(conversationId, page);

    if (newMessages.length === 0) {
      setHasMoreMessages(false);
    } else {
      const scrollHeightBefore = messagesContainerRef.current.scrollHeight;

      newMessages.reverse();
      setMessages((prevMessages) => [...newMessages, ...prevMessages]);

      setTimeout(() => {
        const scrollHeightAfter = messagesContainerRef.current.scrollHeight;
        const scrollDifference = scrollHeightAfter - scrollHeightBefore;

        // Adjust the scroll position to maintain the user's position
        messagesContainerRef.current.scrollTop += scrollDifference;
      }, 0);
    }
  };


  const shouldShowTimestamp = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);

    const diffMinutes = (currentDate - previousDate) / 1000 / 60;
    return diffMinutes > 5 || currentDate.toDateString() !== previousDate.toDateString();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    return date.toDateString() !== today.toDateString() ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` : null;
  };

  return (
    <>
      <div
        className={styles.messages}
        onScroll={handleScroll}
        ref={messagesContainerRef} // Attach the ref to the messages container
      >
        {!selectedConversation && <div>Select a conversation to view messages</div>}
        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const showTimestamp = shouldShowTimestamp(message, previousMessage);
          const dateToShow = formatDate(message.timestamp);

          return (
            <div key={message.id}>
              <div className={`${styles.messageHeader} ${(message.senderId === user.id) ? styles.sent : styles.received}`}>
                {showTimestamp &&
                  <time dateTime={message.timestamp} className={styles.timestamp}>
                    {dateToShow ? dateToShow : new Date(message.timestamp).toLocaleTimeString()}
                  </time>
                }
                <div className={styles.sender}>
                  <Link to={`/profile/${message.senderId}`}>
                    {message.sender.firstName} {message.sender.lastName}
                  </Link>
                </div>
              </div>
              <div className={`${styles.message} ${(message.senderId === user.id) ? styles.messageSend : styles.messageReceived}`}>
                <p>{message.content}</p>
              </div>

            </div>
          )
        })}
        {/* Dummy div to mark the end of the messages for scrolling */}
        <div ref={messagesEndRef} />
      </div>
      {
        selectedConversation && (
          <div className={styles.messageInput}>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder='Send a message'
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        )
      }
      {
        showScrollButton && (
          <button
            className={`${styles.scrollButton} ${showScrollButton ? styles.show : ''}`}
            onClick={scrollToBottom}
          >
            ↓
          </button>
        )
      }
    </>);
}