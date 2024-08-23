import { useEffect, useRef, useState } from 'react';
import styles from './SidebarRight.module.css';
import { useAuth } from './AuthContext';

// Fetch users from the server
export default function SidebarRight({ onConversationSelect }) {
  const { user: userAuth } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  const usersWrapperRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async (page) => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/api/users?page=${page}&limit=20`, {
          method: "GET",
          headers: {
            'Content-Type': "application/json",
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        const newUsers = result.users.filter(u => u.id !== userAuth.id);

        setUsers(prevUsers => {
          // Filter out any users that already exist in prevUsers
          const newUniqueUsers = newUsers.filter(newUser => !prevUsers.some(prevUser => prevUser.id === newUser.id));
          return [...prevUsers, ...newUniqueUsers];
        });

        setHasMoreUsers(page < result.totalPages);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchUsers(page);
  }, [page, userAuth]);

  useEffect(() => {
    const handleScroll = () => {
      const wrapper = usersWrapperRef.current;

      // Check if the user has scrolled near the bottom of the container
      if (wrapper && wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 10 && hasMoreUsers) {
        setPage(prevPage => prevPage + 1);
      }
    };

    const wrapper = usersWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('scroll', handleScroll);
      return () => wrapper.removeEventListener('scroll', handleScroll);
    }
  }, [hasMoreUsers]);

  const handleOpenConversation = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/api/conversations/private/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      onConversationSelect(result.conversationId);
    } catch (err) {
      console.error('Failed to open conversation:', err);
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userList = filteredUsers.map(u => {
    return (
      <li key={u.id}>
        <button onClick={() => handleOpenConversation(u.id)}>
          {u.firstName} {u.lastName}
        </button>
      </li>
    );
  });

  return (
    <div className={styles.usersWrapper} ref={usersWrapperRef}>
      <input
        type='text'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder='Search users'
      />
      <ul className={styles.usersAvailable}>
        {userList}
        <li id="scroll-end"></li> {/* Scroll target for IntersectionObserver */}
      </ul>
      {loading && <div>Loading...</div>}
    </div>
  );
}