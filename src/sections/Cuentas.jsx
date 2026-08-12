import CuentasAccess from "../components/access/CuentasAccess";
import LiquidacionesAccess from "../components/access/LiquidacionesAccess";
import SectionHeader from "../components/funcionales/SectionHeader";
import "./css/sections.css";

const Cuentas = () => (
  <section className="section-container page">
    <SectionHeader title="Cuentas" subtitle="Consulta de saldos, historial y liquidaciones." />
    <div className="sections-options-group">
      <CuentasAccess />
      <LiquidacionesAccess />
    </div>
  </section>
);

export default Cuentas;
