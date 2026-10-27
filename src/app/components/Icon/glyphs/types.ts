export type GlyphNode = readonly [
  tag: 'path' | 'circle' | 'rect' | 'line' | 'polyline',
  attrs: Readonly<Record<string, string | number>>,
];
