import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { MetricasPage } from '../features/metricas/MetricasPage';
import { ResumenPage } from '../features/resumen/ResumenPage';
import { TeamPage } from '../features/team/TeamPage';
import { UsuarioPage } from '../features/usuario/UsuarioPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/resumen" replace />,
      },
      {
        path: 'resumen',
        element: <ResumenPage />,
      },
      {
        path: 'usuario',
        element: <UsuarioPage />,
      },
      {
        path: 'team',
        element: <TeamPage />,
      },
      {
        path: 'metricas',
        element: <MetricasPage />,
      },
    ],
  },
]);
