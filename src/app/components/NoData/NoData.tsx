import { Text } from 'components/Text';

export interface NoDataProps {
  className?: string;
}

export function NoData({ className }: NoDataProps) {
  return (
    <Text as="span" size="inherit" color="tertiary" wrap="normal" className={className}>
      нет данных
    </Text>
  );
}
