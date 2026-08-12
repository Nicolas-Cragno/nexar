import PersonasAccess from "../components/access/PersonasAccess";
import TractoresAccess from "../components/access/TractoresAccess";
import FurgonesAccess from "../components/access/FurgonesAccess";
import EmpresasAccess from "../components/access/EmpresasAccess";
import "./css/sections.css";

const Resources = () => {
  return (
    <section className="section-container page">
      <div className="sections-options-group">
        <div className="section-heading"><h1>Recursos</h1><p>Personas, empresas y unidades disponibles.</p></div>
        <PersonasAccess />
        <EmpresasAccess />
        <TractoresAccess />
        <FurgonesAccess />
      </div>
      <div className="sections-options-group">
        <EmpresasAccess filtro={"clientes"} />
        <EmpresasAccess filtro={"proveedores"} />
      </div>
    </section>
  );
};

export default Resources;
