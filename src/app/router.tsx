import { createBrowserRouter, Navigate } from 'react-router';

import { PATHS } from 'config/paths';
import { AppLayout } from 'layouts/AppLayout';
import { CitizenPage } from 'pages/CitizenPage';
import { DashboardPage } from 'pages/DashboardPage';
import { RegistryPage } from 'pages/RegistryPage';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: PATHS.registry, element: <RegistryPage /> },
      { path: PATHS.citizen, element: <CitizenPage /> },
      { path: '*', element: <Navigate to={PATHS.dashboard} replace /> },
    ],
  },
]);
