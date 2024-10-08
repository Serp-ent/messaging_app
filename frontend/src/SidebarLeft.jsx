import { useState, useEffect } from 'react';
import styles from './App.module.css';
import { useAuth } from './AuthContext';

export default function SidebarLeft({
  selectedConversation,
  onConversationSelect,
}) {
  const { user } = useAuth();
  const [conversationsShort, setConversationsShort] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const authToken = localStorage.getItem('authToken');

      try {
        const response = await fetch('http://localhost:3000/api/conversations', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        setConversationsShort(data.conversations || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ul className={styles.conversationList}>
      {conversationsShort.map((conversation) => {

        // TODO: shouldn't display password
        const otherUser = conversation.participants.at(0).id === user.id ? conversation.participants.at(1) : conversation.participants.at(0);
        const conversationName = (conversation.name != null && conversation.name !== '') ? conversation.name
          : `${otherUser.firstName} ${otherUser.lastName}`;

        return <li key={conversation.id} >
          <button
            onClick={() => onConversationSelect(conversation.id)}
            className={`${styles.conversation} ${conversation.id === selectedConversation ? styles.opened : ''}`}
          >
            <div className={styles.userInfo}>
              <div className={styles.conversationAvatar}></div>
              <div className={styles.conversationName}>{conversationName}</div>
            </div>

            <div className={styles.lastMessage}>{conversation.messages.length > 0 ? conversation.messages[0].content : 'No messages'}</div>
          </button>
        </li>
      })}
    </ul >
  );
}