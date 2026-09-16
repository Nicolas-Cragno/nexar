import "./css/Dashboard.css";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useViajes } from "../contexto/ViajesContext";
import { useAuth } from "../contexto/AuthContext";
import { formatearCampoFirestore } from "../functions/dataFunctions";
import SectionHeader from "../components/funcionales/SectionHeader";
import Ficha from "../components/fichas/Ficha";
import { fichaContent } from "../components/fichas/data/FichaContent";

const Dashboard = () => {
  const { viajes, loading } = useViajes();
  const { permissions } = useAuth();
  const [viajeSeleccionadoId, setViajeSeleccionadoId] = useState(null);
  const viajesActivos = viajes.filter((viaje) => viaje.estado === true);
  const puedeVerViajes = permissions?.allAccess || permissions?.viajesView;
  const viajeSeleccionado = viajes.find(
    (viaje) => viaje.id === viajeSeleccionadoId,
  );

  return (
    <section className="section-container page dashboard-page">
      <SectionHeader title="Dashboard" subtitle="Estado operativo actual" />
      <div className="dashboard-content" aria-busy={loading}>
        {loading ? (
          <p className="dashboard-message" role="status">
            Cargando los viajes activos…
          </p>
        ) : !puedeVerViajes ? (
          <p className="dashboard-message">
            No tenés permisos para consultar los viajes.
          </p>
        ) : (
          <article className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2>
                Viajes activos{" "}
                <span className="dashboard-count">{viajesActivos.length}</span>
              </h2>
              <p>Seleccioná un viaje para abrir su ficha.</p>
            </div>
            {viajesActivos.length === 0 ? (
              <p className="dashboard-empty">
                No hay viajes activos en este momento.
              </p>
            ) : (
              <ul className="dashboard-list dashboard-trips">
                {viajesActivos.map((viaje) => (
                  <li key={viaje.id} className="dashboard-trip">
                    <div className="dashboard-row-heading">
                      <strong>Viaje #{viaje.id}</strong>
                      <span
                        className={`dashboard-badge${viaje.anulado ? " dashboard-badge-muted" : viaje.situacion === "ESPERANDO_TRACTOR" ? " dashboard-badge-pending" : ""}`}
                      >
                        {viaje.estadoLabel}
                      </span>
                    </div>
                    <p className="dashboard-trip-person">
                      {viaje.personaCompleta || "Sin chofer asignado"}
                    </p>
                    <dl className="dashboard-trip-details">
                      <div>
                        <dt>Tractor</dt>
                        <dd>{viaje.tractorCompleto}</dd>
                      </div>
                      <div>
                        <dt>Furgón</dt>
                        <dd>{viaje.furgonCompleto}</dd>
                      </div>
                      <div>
                        <dt>Fecha</dt>
                        <dd>{formatearCampoFirestore(viaje.fecha, true)}</dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      className="dashboard-trip-open"
                      aria-label={`Abrir ficha del viaje ${viaje.id}`}
                      aria-haspopup="dialog"
                      onClick={() => setViajeSeleccionadoId(viaje.id)}
                    >
                      Ver ficha <span aria-hidden="true">↗</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        )}
      </div>
      {puedeVerViajes &&
        viajeSeleccionado &&
        createPortal(
          <Ficha
            elemento={viajeSeleccionado}
            coleccion="viajes"
            container={fichaContent.viajes}
            editable={false}
            onClose={() => setViajeSeleccionadoId(null)}
          />,
          document.body,
        )}
    </section>
  );
};

export default Dashboard;
