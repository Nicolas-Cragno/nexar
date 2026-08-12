import PersonasAccess from "../components/access/PersonasAccess";
import TractoresAccess from "../components/access/TractoresAccess";
import FurgonesAccess from "../components/access/FurgonesAccess";
import EmpresasAccess from "../components/access/EmpresasAccess";
import SectionHeader from "../components/funcionales/SectionHeader";
import "./css/sections.css";

const Resources = () => (
  <section className="section-container page">
    <SectionHeader title="Recursos" subtitle="Personas, empresas y unidades disponibles." />
    <div className="sections-options-group">
      <PersonasAccess />
      <EmpresasAccess />
      <TractoresAccess />
      <FurgonesAccess />
      <EmpresasAccess filtro="clientes" />
      <EmpresasAccess filtro="proveedores" />
    </div>
  </section>
);

export default Resources;
