import styles from './StatusAnnouncer.module.scss';

export interface StatusAnnouncerProps {
  message: string | null;
}

export function StatusAnnouncer({ message }: StatusAnnouncerProps) {
  return (
    <div role="status" className={styles.root}>
      {message}
    </div>
  );
}
