import { useEffect, useState } from 'react';
import styles from './Home.module.css';

export default function SidebarRight() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await fetch(`http://localhost:3000/api/users`);
      const result = await response.json();
      setUsers(result);
    };

    getUsers();
  }, []);

  return (
    <aside className={styles.sidebarRight}>
      <label htmlFor='userFilter'>Search:</label>
      <input id='userFilter' name='userFilter' />
      <ul className={styles.userList}>
        {/* {users.map((user) => (
          <li key={user.id} className={styles.user}>
            <div className={styles.userItem}>
              <div className={styles.userAvatar}></div>
              <div>{user.name}</div>
            </div>
          </li>
        ))} */}
      </ul>
    </aside>
  );
}