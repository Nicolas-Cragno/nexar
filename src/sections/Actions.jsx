import CuentasAccess from "../components/access/CuentasAccess";
import ViajesAccess from "../components/access/ViajesAccess";
//import CrucesAccess from "../components/access/CrucesAccess";

const Actions = () => {
  return (
    <section className="section-container page">
      <div className="sections-options-group">
        <CuentasAccess />
        <ViajesAccess />
        {/*
        <CrucesAccess />
        */}
      </div>
    </section>
  );
};

export default Actions;
