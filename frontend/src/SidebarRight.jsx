import { useEffect, useState } from 'react';
import styles from './Home.module.css';
export default function SidebarRight() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // TODO: handle loading, errors
    const getUsers = async () => {
      const response = await fetch(`http://localhost:3000/api/users`);

      const result = await response.json();
      // TODO: remove current user from list of all users
      setUsers(result);
    }

    getUsers();
  }, []);

  return (
    <aside className={styles.sidebarRight}>
      <label htmlFor='userFilter'>
        Search:
      </label>
      <input
        id='userFilter'
        name='userFilter'
      />


    </aside>
  );
}