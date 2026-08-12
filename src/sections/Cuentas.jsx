import CuentasAccess from "../components/access/CuentasAccess";
import LiquidacionesAccess from "../components/access/LiquidacionesAccess";
import "./css/sections.css";

const Cuentas = () => (
  <section className="section-container page">
    <div className="sections-options-group">
      <div className="section-heading">
        <h1>Cuentas</h1>
        <p>Consulta de saldos, historial y liquidaciones.</p>
      </div>
      <CuentasAccess />
      <LiquidacionesAccess />
    </div>
  </section>
);

export default Cuentas;
