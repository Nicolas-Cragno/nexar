//------------------------------------------------------ externos
import { memo, useEffect, useState } from "react";
import { FaRegFilePdf as PDFsLogo } from "react-icons/fa6";
//------------------------------------------------------ elementos
import TextButton from "../buttons/TextButton.jsx";
import CloseButton from "../buttons/CloseButton";
import FormGestor from "../formularios/FormGestor.jsx";
//------------------------------------------------------ funciones
import {
  formatearCampoFirestore,
  formatearMonto,
} from "../../functions/dataFunctions";
import { eventos } from "../formularios/data/FormContent.js";
import { fichaContent } from "./data/FichaContent.js";
import { submitFinViaje } from "../formularios/data/Submits.js";
import { getSubmitFunction } from "../formularios/data/SubmitGestor.js";
import {
  generarDocumentoCruce,
  generarDocumentos,
} from "../../functions/docFunctions.js";
//------------------------------------------------------ estilos
import "./css/Fichas.css";
import imgPlantilla from "../../functions/docs/hojaRuta.png";
import { usePersonas } from "../../contexto/PersonasContext.js";
import { useTractores } from "../../contexto/TractoresContext.js";
import { useFurgones } from "../../contexto/FurgonesContext.js";
import { useData } from "../../contexto/DataContext.js";
import { useViajes } from "../../contexto/ViajesContext.js";
import { useMovimientos } from "../../contexto/MovimientosContext.js";
import { useLiquidaciones } from "../../contexto/LiquidacionesContext.js";
import FormLiquidacion from "../formularios/FormLiquidacion.jsx";

const CUIT_TRANSCAN = "33719349949";

const impactoEnCuenta = (movimiento, cuentaId) => {
  const monto = Number(movimiento.monto) || 0;
  const tipo = movimiento.tipo === "PAGO" ? "ADELANTO" : movimiento.tipo;
  const impactoContraparte = tipo === "ADELANTO" ? monto : -monto;
  return String(cuentaId) === CUIT_TRANSCAN ? -impactoContraparte : impactoContraparte;
};

const Ficha = ({
  elemento,
  coleccion = null,
  area = null,
  onRender,
  container = Object.keys(elemento),
  reload = null,
  onClose,
  editable = true,
}) => {
  const { personas } = usePersonas();
  const { tractores } = useTractores();
  const { furgones } = useFurgones();
  const { cuentaCorriente } = useData();
  const { viajes } = useViajes();
  const { movimientos } = useMovimientos();
  const { liquidaciones } = useLiquidaciones();
  const titulado = container.find((campo) => campo.type === "title");
  const tituladoAbajo = container.find((campo) => campo.type === "secondtitle");
  const titulo = titulado ? elemento[titulado.key] : elemento["id"];
  const tituloAbajo = tituladoAbajo ? elemento[tituladoAbajo.key] : null;
  const estado = container.find((campo) => campo.type === "state");
  const estadoLabel = elemento.estadoLabel || false;
  const estadoSubtitulo = estado ? "ACTIVO" : "DADO DE BAJA";
  const [formEditarVisible, setFormEditarVisible] = useState(false);
  const [formLiquidacionVisible, setFormLiquidacionVisible] = useState(false);
  const [viajeVinculado, setViajeVinculado] = useState(null);
  const [modalStateVisible, setModalStateVisible] = useState(false);
  const eventosPorteria = eventos.porteria;
  const eventosViaje = eventos.viajes;

  const auxCampos =
    coleccion?.toLowerCase() || area?.toLowerCase() || "personas";

  const campos = fichaContent[auxCampos] ?? [];
  const esCuenta = auxCampos === "cuentacorriente";
  const esViaje = auxCampos === "viajes";
  const esPersona = auxCampos === "personas";
  const cuentaId = esCuenta
    ? elemento.id
    : elemento.cuenta || elemento.cuit;
  const cuentaAsociada = cuentaCorriente.find(
    (cuenta) => String(cuenta.id) === String(cuentaId),
  );
  const movimientosCuenta = movimientos.filter(
    (movimiento) => String(movimiento.cuenta || movimiento.persona) === String(cuentaId),
  );
  const liquidacionesCuenta = liquidaciones.filter(
    (liquidacion) => String(liquidacion.cuenta || liquidacion.persona) === String(cuentaId),
  );
  const viajesPersona = esPersona
    ? viajes.filter((viaje) => String(viaje.persona) === String(elemento.id))
    : [];
  const viajeActivoPersona = viajesPersona.find((viaje) => viaje.estado === true);
  const movimientosViaje = esViaje
    ? movimientos.filter((movimiento) => String(movimiento.viaje) === String(elemento.id))
    : [];
  const resumenViaje = movimientosViaje.reduce(
    (resumen, movimiento) => {
      const monto = Number(movimiento.monto) || 0;
      const tipo = movimiento.tipo === "PAGO" ? "ADELANTO" : movimiento.tipo;
      if (tipo === "ADELANTO") resumen.adelantos += monto;
      if (tipo === "GASTO") resumen.gastos += monto;
      if (tipo === "COBRO") resumen.cobros += monto;
      resumen.saldo += tipo === "ADELANTO" ? monto : -monto;
      return resumen;
    },
    { adelantos: 0, gastos: 0, cobros: 0, saldo: 0 },
  );

  const stateButton = campos.find((cp) => cp.type === "stateButton");

  const campoPdf = campos.find((cp) => cp.type === "pdf");

  const bloquePrincipal = campos.filter(
    (campo) =>
      campo.type === "principal" &&
      elemento[campo.key] !== undefined &&
      elemento[campo.key] !== null &&
      elemento[campo.key] !== "",
  );

  const bloqueSecundario = campos.filter(
    (campo) =>
      campo.type === "secondary" &&
      elemento[campo.key] !== undefined &&
      elemento[campo.key] !== null &&
      elemento[campo.key] !== "",
  );

  const bloqueBool = campos.filter(
    (campo) =>
      campo.type === "boolean" &&
      elemento[campo.key] !== undefined &&
      elemento[campo.key] !== null &&
      elemento[campo.key] !== "",
  );

  // gestion para dar de alta o baja un viaje
  const handleStateClick = async (st) => {
    if (!stateButton?.submitType) return;
    if (!st) return;

    const submitFc = getSubmitFunction(stateButton.submitType);

    if (!submitFc) {
      console.error(`No existe la acción ${stateButton.submitType}`);
      return;
    }

    await submitFc(elemento, false, onClose);
  };

  if (!elemento || typeof elemento !== "object") {
    console.log("[Error] Ficha espera recibir un objeto elemento");
    return null;
  }
  console.log(`----------- Render Ficha ${elemento.id}`);

  const handleClose = async () => {
    if (reload) await reload();
    setFormEditarVisible(false);
    onClose();
  };

  const handleImprimir = async () => {
    await generarDocumentos("pdf", elemento, imgPlantilla, true);
  }

  const handleImprimirCruce = async (cruce) => {
    const personaCruce = personas.find(
      (persona) => String(persona.id) === String(cruce.persona),
    );
    const tractorCruce = tractores.find(
      (tractor) => String(tractor.id) === String(cruce.tractor),
    );
    const idsFurgones = Array.isArray(cruce.furgon)
      ? cruce.furgon
      : cruce.furgon
        ? [cruce.furgon]
        : [];
    const furgonesCruce = furgones.filter((furgon) =>
      idsFurgones.some((id) => String(id) === String(furgon.id)),
    );

    await generarDocumentoCruce(
      {
        ...elemento,
        personaCompleta: personaCruce?.label || elemento.personaCompleta,
        tractorCompleto: tractorCruce?.label || elemento.tractorCompleto,
        furgonCompleto:
          furgonesCruce.map((furgon) => furgon.label).join(", ") ||
          elemento.furgonCompleto,
      },
      cruce,
    );
  };
  
  return (
    <div className="ficha">
      <div className="ficha-content">
        <CloseButton onClose={onClose} />
        <h1 className="ficha-header">
          <strong className="ficha-id">
            {titulo}{" "}
            {campoPdf && (
              <PDFsLogo
                className="pdf-logo" onClick={handleImprimir}
              />
            )}
          </strong>
          {tituladoAbajo && <span className="nombres">{tituloAbajo}</span>}{" "}
        </h1>
        <hr />

        <p className="status" onClick={() => handleStateClick(elemento.estado)}>
          {estadoLabel || estadoSubtitulo}
        </p>
        <div className="ficha-subheader">
          {campos.map((campo, index) => {
            const valor = elemento[campo.key];

            if (!valor || campo.type !== "subtitle") return null;

            return <span>{valor}</span>;
          })}
        </div>

        {bloquePrincipal.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Información</strong>
            </label>
            <div className="ficha-info-box">
              {campos.map((campo, index) => {
                const valor = elemento[campo.key];

                if (!valor || campo.type !== "principal") return null;

                return (
                  <div key={campo.key || index}>
                    <div className="ficha-info">
                      <strong>{campo.label} : </strong>
                      <span>
                        {formatearCampoFirestore(
                          valor,
                          campo.soloFecha,
                        ).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {bloqueSecundario.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Otros datos</strong>
            </label>
            <div className="ficha-info-box">
              {campos.map((campo, index) => {
                const valor = elemento[campo.key];

                if (!valor || campo.type !== "secondary") return null;

                return (
                  <div key={campo.key || index}>
                    <div className="ficha-info">
                      <strong>{campo.label} : </strong>
                      <span>
                        {formatearCampoFirestore(valor).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {bloqueBool.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Documentación</strong>
            </label>
            <div className="ficha-info-box">
              {campos.map((campo, index) => {
                const valor = elemento[campo.key];

                if (!valor || campo.type !== "boolean") return null;

                return (
                  <span
                    key={campo.key}
                    className={`chequeo-item ${
                      valor ? "chequeo-ok" : "chequeo-fail"
                    }`}
                  >
                    {campo.label}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {elemento.chequeos && (
          <>
            <label>
              <strong className="ficha-info-title">Chequeos</strong>
            </label>
            <div className="checkbox-list">
              {eventosPorteria
                .find((campo) => campo.key === "chequeos")
                ?.items.map((item) => {
                  const valor = elemento.chequeos?.[item.key];

                  return (
                    <span
                      key={item.key}
                      className={`chequeo-item ${
                        valor ? "chequeo-ok" : "chequeo-fail"
                      }`}
                    >
                      {item.label}
                    </span>
                  );
                })}
            </div>
          </>
        )}

        {elemento.tramos?.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Tramos</strong>
            </label>

            <div className="ficha-info-box ficha-tramos">
              {elemento.tramos.map((tramo, index) => (
                <div key={index} className="ficha-tramo">
                  <div className="ficha-tramo-header">
                    <strong>
                      {tramo.lugarSalidaLabel} → {tramo.lugarLlegadaLabel}
                    </strong>
                  </div>

                  <div className="ficha-tramo-fechas">
                    <div>
                      <span className="ficha-tramo-label">Inicio</span>
                      <span>
                        {tramo.fechaSalida
                          ? formatearCampoFirestore(tramo.fechaSalida, true)
                          : "-"}
                      </span>
                    </div>

                    <div>
                      <span className="ficha-tramo-label">Fin</span>
                      <span>
                        {tramo.fechaLlegada
                          ? formatearCampoFirestore(tramo.fechaLlegada, true)
                          : "-"}
                      </span>
                    </div>
                  </div>
                  {tramo.detalle && (
                    <div className="ficha-tramo-detalle">{tramo.detalle}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {esViaje && (
          <>
            <label><strong className="ficha-info-title">Resumen económico</strong></label>
            <div className="ficha-summary-grid">
              <div><span>Adelantos</span><strong>$ {formatearMonto(resumenViaje.adelantos)}</strong></div>
              <div><span>Gastos</span><strong>$ {formatearMonto(resumenViaje.gastos)}</strong></div>
              <div><span>Cobros</span><strong>$ {formatearMonto(resumenViaje.cobros)}</strong></div>
              <div><span>Saldo neto</span><strong>$ {formatearMonto(resumenViaje.saldo)}</strong></div>
            </div>
          </>
        )}

        {movimientosViaje.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">
                Movimientos de cuenta
              </strong>
            </label>

            <div className="ficha-info-box">
              {movimientosViaje.map((movimiento, index) => (
                <div key={movimiento.id || index} className={`ficha-info movement-${movimiento.tipo?.toLowerCase()}`}>
                  <div className="obj-info-body">
                    <strong className="obj-info-fecha">
                      {movimiento.fecha && (
                        <span>
                          {formatearCampoFirestore(movimiento.fecha, true)} · {movimiento.tipo}
                        </span>
                      )}
                    </strong>
                    <span className="obj-info-monto">
                      ${formatearMonto(movimiento.monto)}
                    </span>
                  </div>
                  {movimiento.detalle && (
                    <div className="obj-info-footer">{movimiento.detalle}</div>
                  )}
                  <div className="obj-info-footer">
                    {movimiento.operadorCompleto}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {elemento.crucesRegistrados?.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Cruces de barcaza</strong>
            </label>

            <div className="ficha-info-box">
              {elemento.crucesRegistrados.map((cruce, index) => (
                <div key={cruce.id || index} className="ficha-info">
                  <div className="obj-info-body">
                    <strong className="obj-info-fecha">
                      {cruce.fecha && (
                        <span>
                          {formatearCampoFirestore(cruce.fecha, true)}
                        </span>
                      )}
                    </strong>
                    <span className="obj-info-id">{cruce.id}</span>
                    <PDFsLogo
                      className="pdf-logo"
                      title="Imprimir cruce"
                      onClick={() => handleImprimirCruce(cruce)}
                    />
                  </div>
                  <div className="obj-info-footer">
                    Chofer: {cruce.persona || "-"} · Tractor: {cruce.tractor || "-"}
                  </div>
                  <div className="obj-info-footer">
                    Furgones: {Array.isArray(cruce.furgon)
                      ? cruce.furgon.join(", ") || "-"
                      : cruce.furgon || "-"}
                  </div>
                  {cruce.detalle && (
                    <div className="obj-info-footer">{cruce.detalle}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {esCuenta && (
          <>
            <label><strong className="ficha-info-title">Resumen de cuenta</strong></label>
            <div className="ficha-summary-grid">
              <div><span>Saldo actual</span><strong>$ {formatearMonto(elemento.monto)}</strong></div>
              <div><span>Pendientes</span><strong>{movimientosCuenta.filter((m) => m.estado === false).length}</strong></div>
              <div><span>Liquidados</span><strong>{movimientosCuenta.filter((m) => m.estado === true).length}</strong></div>
              <div><span>Liquidaciones</span><strong>{liquidacionesCuenta.length}</strong></div>
            </div>
            <label><strong className="ficha-info-title">Historial de movimientos</strong></label>
            <div className="ficha-info-box">
              {movimientosCuenta.length === 0 && <p>Sin movimientos registrados.</p>}
              {movimientosCuenta.map((movimiento) => {
                const impacto = impactoEnCuenta(movimiento, elemento.id);
                return (
                  <div key={movimiento.id} className={`ficha-info movement-${movimiento.tipo?.toLowerCase()}`}>
                    <div className="obj-info-body">
                      <strong>{movimiento.tipo} · {movimiento.id}</strong>
                      <span className={impacto >= 0 ? "money positive" : "money negative"}>
                        {impacto >= 0 ? "+" : "−"} $ {formatearMonto(Math.abs(impacto))}
                      </span>
                    </div>
                    <div className="obj-info-footer">
                      {movimiento.estado === true ? "Liquidado" : "Pendiente"}
                      {movimiento.viaje ? ` · Viaje ${movimiento.viaje}` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
            <label><strong className="ficha-info-title">Liquidaciones anteriores</strong></label>
            <div className="ficha-info-box">
              {liquidacionesCuenta.length === 0 && <p>Sin liquidaciones registradas.</p>}
              {liquidacionesCuenta.map((liquidacion) => (
                <div key={liquidacion.id} className="ficha-info">
                  <div className="obj-info-body"><strong>{liquidacion.id}</strong><span>{liquidacion.saldoCompleto}</span></div>
                  <div className="obj-info-footer">{liquidacion.cantidadMovimientos} movimientos · {liquidacion.tipoCierreCompleto}</div>
                </div>
              ))}
            </div>
            <div className="ficha-buttons">
              <TextButton text="NUEVA LIQUIDACIÓN" onClick={() => setFormLiquidacionVisible(true)} />
            </div>
          </>
        )}

        {esPersona && (
          <>
            <label><strong className="ficha-info-title">Actividad del chofer</strong></label>
            <div className="ficha-summary-grid">
              <div><span>Cuenta corriente</span><strong>{cuentaAsociada?.id || "Sin cuenta"}</strong></div>
              <div><span>Saldo actual</span><strong>{cuentaAsociada ? `$ ${formatearMonto(cuentaAsociada.monto)}` : "-"}</strong></div>
              <div><span>Viaje activo</span><strong>{viajeActivoPersona?.id || "Ninguno"}</strong></div>
              <div><span>Viajes históricos</span><strong>{viajesPersona.length}</strong></div>
            </div>
            {viajeActivoPersona && (
              <div className="ficha-buttons">
                <TextButton text={`VER VIAJE ${viajeActivoPersona.id}`} onClick={() => setViajeVinculado(viajeActivoPersona)} />
              </div>
            )}
            <label><strong className="ficha-info-title">Historial relacionado</strong></label>
            <div className="ficha-info-box">
              <p>{viajesPersona.length} viajes · {movimientosCuenta.length} movimientos · {liquidacionesCuenta.length} liquidaciones</p>
              {viajesPersona.map((viaje) => (
                <button className="ficha-link" key={viaje.id} onClick={() => setViajeVinculado(viaje)}>
                  {viaje.id} · {viaje.estado ? "En viaje" : "Finalizado"}
                </button>
              ))}
            </div>
            <label><strong className="ficha-info-title">Movimientos</strong></label>
            <div className="ficha-info-box">
              {movimientosCuenta.length === 0 && <p>Sin movimientos registrados.</p>}
              {movimientosCuenta.map((movimiento) => (
                <div key={movimiento.id} className={`ficha-info movement-${movimiento.tipo?.toLowerCase()}`}>
                  <div className="obj-info-body"><strong>{movimiento.tipo} · {movimiento.id}</strong><span>$ {formatearMonto(movimiento.monto)}</span></div>
                  <div className="obj-info-footer">{movimiento.estado ? "Liquidado" : "Pendiente"}</div>
                </div>
              ))}
            </div>
            <label><strong className="ficha-info-title">Liquidaciones</strong></label>
            <div className="ficha-info-box">
              {liquidacionesCuenta.length === 0 && <p>Sin liquidaciones registradas.</p>}
              {liquidacionesCuenta.map((liquidacion) => (
                <div key={liquidacion.id} className="ficha-info">
                  <div className="obj-info-body"><strong>{liquidacion.id}</strong><span>{liquidacion.saldoCompleto}</span></div>
                </div>
              ))}
            </div>
          </>
        )}

        {formEditarVisible && (
          <FormGestor
            elemento={elemento}
            tipo={coleccion}
            coleccion={coleccion}
            onGuardar={handleClose}
            onClose={handleClose}
          />
        )}
        {formLiquidacionVisible && (
          <FormLiquidacion
            cuentaInicial={String(elemento.id)}
            onClose={() => setFormLiquidacionVisible(false)}
          />
        )}
        {viajeVinculado && (
          <Ficha
            elemento={viajeVinculado}
            coleccion="viajes"
            container={fichaContent.viajes}
            editable={false}
            onClose={() => setViajeVinculado(null)}
          />
        )}

        <div className="ficha-info-footer">
          {container.map((campo, index) => {
            const valor = elemento[campo.key];

            if (!valor || campo.type !== "footer") return null;

            return (
              <div key={campo.key || index}>
                <div className="ficha-data">
                  <strong>{campo.label} : </strong>
                  <span>
                    {formatearCampoFirestore(
                      valor,
                      campo.soloFecha,
                    ).toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {editable && (
          <div className="ficha-buttons">
            <TextButton
              text={"EDITAR"}
              onClick={() => setFormEditarVisible(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Ficha);
