import CuentasAccess from "../components/access/CuentasAccess";
import ViajesAccess from "../components/access/ViajesAccess";

const Actions = () => {
  return (
    <section className="section-container page">
      <div className="sections-options-group">
        <CuentasAccess />
        <ViajesAccess />
      </div>
    </section>
  );
};

export default Actions;
