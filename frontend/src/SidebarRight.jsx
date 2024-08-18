import { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { useAuth } from './AuthContext';

export default function SidebarRight() {
  const { user: userAuth } = useAuth();
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // TODO: on click it should open conversation with that user
  const userList = users.map(u => {
    return <li key={u.id}>
      <button onClick={() => {console.log('open conversation with', u.id)}}>
        {u.firstName} {u.lastName}
      </button>
    </li>
  })
  return (
    <div>
      <label>
        Search:
      </label>
      <input/>
      <ul>
        {userList}
      </ul>

    </div>
  );
}