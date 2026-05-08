import { NavLink, Outlet } from 'react-router-dom';
import { ErrorState } from '../../shared/components/ErrorState';
import { useInventariosData } from '../../shared/hooks/useInventariosData';
import { formatDateTime } from '../../shared/utils/dates';

export function AppLayout() {
  const inventariosData = useInventariosData();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__eyebrow">Inventarios 2026</span>
          <h1 className="topbar__title">Dashboard de Inventarios</h1>
        </div>

        <nav className="topbar__nav" aria-label="Navegacion principal">
          <NavLink className={({ isActive }) => `topbar__link${isActive ? ' topbar__link--active' : ''}`} to="/resumen">
            Resumen
          </NavLink>
          <NavLink className={({ isActive }) => `topbar__link${isActive ? ' topbar__link--active' : ''}`} to="/usuario">
            Usuario
          </NavLink>
          <NavLink className={({ isActive }) => `topbar__link${isActive ? ' topbar__link--active' : ''}`} to="/team">
            Team
          </NavLink>
          <NavLink className={({ isActive }) => `topbar__link${isActive ? ' topbar__link--active' : ''}`} to="/metricas">
            Metricas
          </NavLink>
        </nav>

        <div className="topbar__actions">
          <span className="topbar__status" aria-live="polite">
            {inventariosData.loading ? 'Consultando endpoint' : `Ultima consulta: ${formatDateTime(inventariosData.lastUpdated)}`}
          </span>
          <button
            className="button button--primary"
            type="button"
            disabled={inventariosData.loading}
            onClick={() => void inventariosData.refresh()}
          >
            Actualizar
          </button>
        </div>
      </header>

      <main className="app-shell__main">
        {inventariosData.error ? (
          <ErrorState error={inventariosData.error} onRetry={() => void inventariosData.retry()} />
        ) : null}
        <Outlet context={inventariosData} />
      </main>
    </div>
  );
}
