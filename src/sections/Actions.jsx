import MovimientosAccess from "../components/access/MovimientosAccess";
import ViajesAccess from "../components/access/ViajesAccess";
import CrucesAccess from "../components/access/CrucesAccess";

const Actions = () => {
  return (
    <section className="section-container page">
      <div className="sections-options-group">
        <div className="section-heading"><h1>Operaciones</h1><p>Gestión diaria de viajes, movimientos y documentación.</p></div>
        <ViajesAccess />
        <MovimientosAccess />
        <CrucesAccess />
      </div>
    </section>
  );
};

export default Actions;
