import { Brand } from '../Brand';
import { SidebarNav } from '../SidebarNav';
import styles from './Sidebar.module.scss';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Brand />
      <SidebarNav />
    </aside>
  );
}
