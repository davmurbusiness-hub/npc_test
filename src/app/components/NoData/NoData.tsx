import { Text } from 'components/Text';

export interface NoDataProps {
  className?: string;
}

export function NoData({ className }: NoDataProps) {
  return (
    <Text as="span" size="inherit" color="tertiary" className={className}>
      нет данных
    </Text>
  );
}
