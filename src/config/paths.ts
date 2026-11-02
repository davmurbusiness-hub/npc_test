export const PATHS = {
  dashboard: '/',
  registry: '/registry',
  citizen: '/registry/:id',
} as const;

export const citizenPath = (id: string | number) => `${PATHS.registry}/${id}`;
