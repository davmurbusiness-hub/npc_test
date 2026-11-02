export type BadgeTone = 'neutral' | 'info' | 'positive' | 'warning' | 'negative';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}
