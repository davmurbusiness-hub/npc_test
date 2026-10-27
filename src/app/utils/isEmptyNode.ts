import type { ReactNode } from 'react';

export function isEmptyNode(node: ReactNode): boolean {
  if (Array.isArray(node)) return node.every(isEmptyNode);
  if (node === undefined || node === null || typeof node === 'boolean') return true;
  return typeof node === 'string' && node.trim() === '';
}
