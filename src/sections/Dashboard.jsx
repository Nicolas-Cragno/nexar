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

  const cuentaTCC = cuentaCorriente.find((cc) => cc.id === "33719349949");
  const montoTCC = cuentaTCC?.monto || 0;

  const movimientosRecientes = movimientos.slice(0, 5);
  const liquidacionesRecientes = liquidaciones.slice(0, 5);

  return (
    <section className="section-container page">
      <SectionHeader title={"Dashboard"} subtitle={"Estado operativo actual"} />

      <div className="dashboard-content">
        <div className="dashboard-metrics">
          <Link>
            <span>Viajes</span>
            <strong>{viajesActivos.length} activos</strong>
          </Link>
          <Link>
            <span>Movimientos de cuenta</span>
            <strong>{movimientosPendientes.length} pendientes</strong>
          </Link>
          <Link>
            <span>{`Saldo (${cuentasConSaldo.length} cuentas con saldo pendiente)`}</span>
            <strong>$ {formatearMonto(montoTCC)}</strong>
          </Link>
        </div>
        <div className="dashboard-panels">
          <article className="dashboard-panel">
            <h2>{viajesActivos.length} Viajes activos</h2>
            <p className="dashboard-panel">
              {viajesActivos.map((viaje) => (
                <div key={viaje.id}>
                  <strong>{viaje.label}</strong>
                </div>
              ))}
            </p>
          </article>
          <article className="dashboard-panel">
            <h2>{movimientosRecientes.length} Movimientos recientes</h2>
            <p className="dashboard-panel">
              {movimientosRecientes.map((movimiento) => (
                <div key={movimiento.id}>
                  <strong>{movimiento.label}</strong>
                  <span>
                    {movimiento.fecha
                      ? formatearCampoFirestore(movimiento.fecha, true)
                      : "-"}
                  </span>
                </div>
              ))}
            </p>
          </article>
          <article className="dashboard-panel">
            <h2>Cuentas pendientes de liquidar</h2>
            <p className="dashboard-panel">
              {cuentasConSaldo.map((cuenta) => (
                <div key={cuenta.id}>
                  <strong>{cuenta.nombre || cuenta.id}</strong>
                  <span>$ {formatearMonto(cuenta.monto)}</span>
                </div>
              ))}
            </p>
          </article>
          <article className="dashboard-panel">
            <h2>{liquidacionesRecientes.length} Liquidaciones recientes</h2>

            <p className="dashboard-panel">
              {liquidacionesRecientes.map((liquidacion) => (
                <div key={liquidacion.id}>
                  <strong>{liquidacion.label}</strong>
                </div>
              ))}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
