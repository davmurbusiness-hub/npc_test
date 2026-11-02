import { Outlet } from 'react-router';

import styles from './AppLayout.module.scss';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  return (
    <div className={styles.root}>
      <a href="#content" className={styles.skipLink}>
        Перейти к содержимому
      </a>

      <Sidebar />

      <div className={styles.main}>
        <Topbar />

        <main id="content" tabIndex={-1} className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
