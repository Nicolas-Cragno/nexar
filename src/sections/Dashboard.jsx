import "./css/Dashboard.css";
import { Link } from "react-router-dom";
import { useData } from "../contexto/DataContext";
import { useViajes } from "../contexto/ViajesContext";
import { useMovimientos } from "../contexto/MovimientosContext";
import { useLiquidaciones } from "../contexto/LiquidacionesContext";
import {
  formatearCampoFirestore,
  formatearMonto,
} from "../functions/dataFunctions";
import SectionHeader from "../components/funcionales/SectionHeader";

const Dashboard = () => {
  const { cuentaCorriente } = useData();
  const { viajes } = useViajes();
  const { movimientos } = useMovimientos();
  const { liquidaciones } = useLiquidaciones();
  const viajesActivos = viajes.filter((viaje) => viaje.estado === true);
  const movimientosPendientes = movimientos.filter(
    (movimiento) => movimiento.estado === false,
  );
  const cuentasConSaldo = cuentaCorriente.filter(
    (cuenta) => Number(cuenta.monto) !== 0,
  );
  const movimientosRecientes = movimientos.slice(0, 5);
  const liquidacionesRecientes = liquidaciones.slice(0, 5);

  return (
    <section className="section-container page">
      <SectionHeader title={"Dashboard"} subtitle={"Estado operativo actual"} />

      <div className="dashboard-content">
        <div className="dashboard-metrics">
          <Link>
            <span>Viajes activos</span>
            <strong>{viajesActivos.length}</strong>
          </Link>
          <Link>
            <span>Movimientos pendientes</span>
            <strong>{movimientosPendientes.length}</strong>
          </Link>
          <Link>
            <span>Cuentas con saldo</span>
            <strong>{cuentasConSaldo.length}</strong>
          </Link>
          <Link>
            <span>Liquidaciones recientes</span>
            <strong>{liquidacionesRecientes.length}</strong>
          </Link>
        </div>
        <div className="dashboard-panels">
          <article className="dashboard-panel">
            <h2>Viajes activos</h2>
            {viajesActivos.length === 0 && <p>Sin viajes activos.</p>}
            {viajesActivos.slice(0, 5).map((viaje) => (
              <div key={viaje.id}>
                <strong>{viaje.id}</strong>
                <span>{viaje.personaCompleta || viaje.persona}</span>
              </div>
            ))}
          </article>
          <article className="dashboard-panel">
            <h2>Movimientos recientes</h2>
            {movimientosRecientes.length === 0 && <p>Sin movimientos.</p>}
            {movimientosRecientes.map((movimiento) => (
              <div key={movimiento.id}>
                <strong>
                  {movimiento.tipo} · $ {formatearMonto(movimiento.monto)}
                </strong>
                <span>
                  {movimiento.fecha
                    ? formatearCampoFirestore(movimiento.fecha, true)
                    : "-"}
                </span>
              </div>
            ))}
          </article>
          <article className="dashboard-panel">
            <h2>Cuentas pendientes de liquidar</h2>
            {cuentasConSaldo.length === 0 && <p>Sin cuentas con saldo.</p>}
            {cuentasConSaldo.slice(0, 5).map((cuenta) => (
              <div key={cuenta.id}>
                <strong>{cuenta.nombre || cuenta.id}</strong>
                <span>$ {formatearMonto(cuenta.monto)}</span>
              </div>
            ))}
          </article>
          <article className="dashboard-panel">
            <h2>Liquidaciones recientes</h2>
            {liquidacionesRecientes.length === 0 && <p>Sin liquidaciones.</p>}
            {liquidacionesRecientes.map((liquidacion) => (
              <div key={liquidacion.id}>
                <strong>{liquidacion.id}</strong>
                <span>{liquidacion.cuentaCompleta}</span>
              </div>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
