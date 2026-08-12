import MovimientosAccess from "../components/access/MovimientosAccess";
import ViajesAccess from "../components/access/ViajesAccess";
import CrucesAccess from "../components/access/CrucesAccess";
import SectionHeader from "../components/funcionales/SectionHeader";
import "./css/sections.css";

const Actions = () => (
  <section className="section-container page">
    <SectionHeader title="Operaciones" subtitle="Gestión diaria de viajes, movimientos y documentación." />
    <div className="sections-options-group">
      <ViajesAccess />
      <MovimientosAccess />
      <CrucesAccess />
    </div>
  </section>
);

export default Actions;
