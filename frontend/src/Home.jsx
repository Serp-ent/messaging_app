import { useState } from 'react';
import styles from './Home.module.css'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <div className={styles.mainContainer}>
      <aside className={`${styles.sidebarLeft} ${isMenuOpen ? styles.open : ''}`}>
        <ul>
          <li><a href="">Contact1</a></li>
          <li><a href="">Contact2</a></li>
          <li><a href="">Contact3</a></li>
          <li><a href="">Contact4</a></li>
        </ul>
      </aside>

      <main className={styles.main}>
        <h1>Main content</h1>
      </main>

      <aside className={styles.sidebarRight}>

      </aside>

      <button className={styles.menuButton} onClick={toggleMenu}>
        &#9776;
      </button>
      {isMenuOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}
    </div>
  );
}