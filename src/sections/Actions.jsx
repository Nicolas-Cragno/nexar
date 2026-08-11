import CuentasAccess from "../components/access/CuentasAccess";
import ViajesAccess from "../components/access/ViajesAccess";
import CrucesAccess from "../components/access/CrucesAccess";
import LiquidacionesAccess from "../components/access/LiquidacionesAccess";

const Actions = () => {
  return (
    <section className="section-container page">
      <div className="sections-options-group">
        <CuentasAccess />
        <ViajesAccess />
        <CrucesAccess />
        <LiquidacionesAccess />
      </div>
    </section>
  );
};

export default Actions;
