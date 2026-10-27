import type { ReactNode } from 'react';

export function isRenderable(node: ReactNode): boolean {
  if (Array.isArray(node)) return node.some(isRenderable);
  return node !== undefined && node !== null && typeof node !== 'boolean' && node !== '';
}
