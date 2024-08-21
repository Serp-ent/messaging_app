import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useConversationContext } from './App';
import styles from './App.module.css'

export default function Conversation() {
  const { user } = useAuth();
  const {
    handleScroll,
    messagesContainerRef,
    selectedConversation,
    messages,
    messagesEndRef,
    messageContent,
    setMessageContent,
    scrollToBottom,
    sendMessage,
    showScrollButton,
  } = useConversationContext();

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