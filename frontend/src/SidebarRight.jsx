import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { useAuth } from './AuthContext';

export default function SidebarRight({ onConversationSelect }) {
  const { user: userAuth } = useAuth();
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3000/api/users/`, {
          method: "GET",
          headers: {
            'Content-Type': "application/json",
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();

        const users = result.users.filter(u => u.id !== userAuth.id);
        setUsers(users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [userAuth]);

  if (loading) {
    return <div>Loading...</div>
  }

  if (loading) {
    return <div>Loading...</div>
  }

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
  }

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // TODO: on click it should open conversation with that user
  const userList = filteredUsers.map(u => {
    return <li key={u.id}>
      <button onClick={() => handleOpenConversation(u.id)}>
        {u.firstName} {u.lastName}
      </button>
    </li >
  })
  return (
    <div>
      <label>
        Search:
      </label>
      <input
        type='text'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder='Search users'
      />
      <ul>
        {userList}
      </ul>

    </div>
  );
}