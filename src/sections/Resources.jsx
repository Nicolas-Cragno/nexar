import PersonasAccess from "../components/access/PersonasAccess";
import TractoresAccess from "../components/access/TractoresAccess";
import FurgonesAccess from "../components/access/FurgonesAccess";
import EmpresasAccess from "../components/access/EmpresasAccess";
import "./css/sections.css";

const Resources = () => {
  return (
    <section className="section-container page">
      <div className="sections-options-group">
        <PersonasAccess />
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
