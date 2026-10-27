export type SeriesTone = 'incoming' | 'outgoing';

export type SeriesLineStyle = 'solid' | 'dashed';

export type SeriesMarker = 'circle' | 'square';

export interface SeriesAnnotation {
  index: number;

  caption: string;

  value: number | null;
}

export interface LineSeries {
  id: string;

  label: string;

  values: readonly (number | null)[];
  tone: SeriesTone;
  lineStyle: SeriesLineStyle;
  marker: SeriesMarker;

  annotations: readonly SeriesAnnotation[];
}
