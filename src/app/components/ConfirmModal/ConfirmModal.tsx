import { Button } from 'components/Button';
import { Modal } from 'components/Modal';
import { Text } from 'components/Text';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  className,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      className={className}
      footer={
        <>
          <Button onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Text size="sm" color="secondary">
        {message}
      </Text>
    </Modal>
  );
}
