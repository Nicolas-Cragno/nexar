//------------------------------------------------------ externos
import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaRegFilePdf as PDFsLogo } from "react-icons/fa6";
import Swal from "sweetalert2";
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
import {
  actualizarTractorViaje,
  liberarFurgonViaje,
  submitFinViaje,
} from "../formularios/data/Submits.js";
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
import { useAuth } from "../../contexto/AuthContext.js";
import { anuladores, permisoAnulacion } from "../../functions/anulaciones.js";

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
  const { firebaseUser, fullUser, permissions } = useAuth();
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
  const esCruce = auxCampos === "cruces";
  const esPersona = auxCampos === "personas";
  const tipoAnulable = ["movimientos", "viajes", "cruces", "liquidaciones"].includes(auxCampos)
    ? auxCampos
    : null;
  const permisoRequerido = permisoAnulacion(tipoAnulable);
  const etiquetaAnulacion = ({
    movimientos: "movimiento",
    viajes: "viaje",
    cruces: "cruce",
    liquidaciones: "liquidacion",
  })[tipoAnulable] || "operacion";
  const puedeAnular = Boolean(
    tipoAnulable &&
    elemento.anulado !== true &&
    (permissions?.allAccess === true || permissions?.[permisoRequerido] === true) &&
    !(tipoAnulable === "movimientos" && (elemento.estado === true || elemento.liquidacion || elemento.esCierreLiquidacion))
  );
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
  const viajeActivoPersona = viajesPersona.find((viaje) => viaje.estado === true && viaje.anulado !== true);
  const movimientosViaje = esViaje
    ? movimientos.filter((movimiento) => String(movimiento.viaje) === String(elemento.id))
    : [];
  const resumenViaje = movimientosViaje.filter((movimiento) => movimiento.anulado !== true).reduce(
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
  const viajeActivo = esViaje && elemento.estado === true && elemento.anulado !== true;
  const puedeGestionarRecursos = viajeActivo && (
    permissions?.allAccess === true || permissions?.viajesWrite === true
  );
  const idsFurgonesViaje = esViaje
    ? (Array.isArray(elemento.furgon) ? elemento.furgon : elemento.furgon ? [elemento.furgon] : []).map(String)
    : [];
  const tractoresDisponibles = tractores.filter((tractor) =>
    tractor.enViaje !== true &&
    !tractor.viajeActivo &&
    String(tractor.id) !== String(elemento.tractor || "") &&
    !viajes.some((viaje) =>
      viaje.estado === true && viaje.anulado !== true && String(viaje.tractor) === String(tractor.id)
    )
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
    if (!st || elemento.anulado === true) return;

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

  const handleGuardarEdicion = async () => {
    if (reload) await reload();
    setFormEditarVisible(false);
  };

  const handleAnular = async () => {
    const motivoResult = await Swal.fire({
      title: `Anular ${etiquetaAnulacion} ${elemento.id}`,
      input: "textarea",
      inputLabel: "Motivo de anulacion",
      inputPlaceholder: "Indique el motivo obligatorio",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b42318",
      inputValidator: (value) => String(value || "").trim() ? undefined : "El motivo es obligatorio.",
    });
    if (!motivoResult.isConfirmed) return;
    const confirmacion = await Swal.fire({
      title: "Confirmar anulacion",
      html: `<p>Se anulara <strong>${etiquetaAnulacion} ${elemento.id}</strong>.</p><p>Esta accion conservara el registro y revertira sus efectos aplicables.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, anular",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b42318",
    });
    if (!confirmacion.isConfirmed) return;
    try {
      await anuladores[tipoAnulable]({
        id: elemento.id,
        motivo: motivoResult.value,
        usuario: { id: fullUser?.id, uid: firebaseUser?.uid },
      });
      await Swal.fire({ title: "Operacion anulada", icon: "success", confirmButtonColor: "#4161bd" });
      if (reload) await reload();
      if (onClose) onClose();
    } catch (error) {
      await Swal.fire({
        title: "No se pudo anular",
        text: error?.message || "No se pudo completar la anulacion.",
        icon: "error",
        confirmButtonColor: "#4161bd",
      });
    }
  };

  const seleccionarTractor = async () => {
    if (!tractoresDisponibles.length) {
      await Swal.fire({
        title: "Sin tractores disponibles",
        icon: "info",
        confirmButtonColor: "#4161bd",
      });
      return null;
    }
    const seleccion = await Swal.fire({
      title: "Seleccionar tractor",
      input: "select",
      inputOptions: Object.fromEntries(
        tractoresDisponibles.map((tractor) => [String(tractor.id), tractor.label || tractor.id]),
      ),
      inputPlaceholder: "Seleccione un tractor",
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#4161bd",
      inputValidator: (value) => value ? undefined : "Seleccione un tractor.",
    });
    return seleccion.isConfirmed ? String(seleccion.value) : null;
  };

  const ejecutarCambioTractor = async (nuevoTractorId) => {
    try {
      await actualizarTractorViaje(elemento.id, nuevoTractorId);
      await Swal.fire({
        title: nuevoTractorId ? "Tractor asignado" : "Tractor liberado",
        icon: "success",
        confirmButtonColor: "#4161bd",
      });
      if (reload) await reload();
    } catch (error) {
      await Swal.fire({
        title: "No se pudo actualizar el tractor",
        text: error?.message || "No hemos podido procesar la solicitud.",
        icon: "error",
        confirmButtonColor: "#4161bd",
      });
    }
  };

  const handleLiberarTractor = async () => {
    const confirmacion = await Swal.fire({
      title: `Liberar tractor ${elemento.tractor}`,
      text: "El chofer y el viaje continuarán activos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#4161bd",
    });
    if (!confirmacion.isConfirmed) return;

    const reemplazo = await Swal.fire({
      title: "¿Desea reemplazarlo?",
      text: "Puede asignar otro tractor disponible o continuar sin tractor.",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Reemplazar",
      denyButtonText: "Continuar sin tractor",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#4161bd",
    });
    if (reemplazo.isDismissed) return;
    if (reemplazo.isDenied) {
      await ejecutarCambioTractor(null);
      return;
    }
    const nuevoId = await seleccionarTractor();
    if (nuevoId) await ejecutarCambioTractor(nuevoId);
  };

  const handleAsignarTractor = async () => {
    const nuevoId = await seleccionarTractor();
    if (nuevoId) await ejecutarCambioTractor(nuevoId);
  };

  const handleLiberarFurgon = async (furgonId) => {
    const confirmacion = await Swal.fire({
      title: `Liberar furgón ${furgonId}`,
      text: "El viaje continuará activo con sus demás recursos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, liberar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#4161bd",
    });
    if (!confirmacion.isConfirmed) return;
    try {
      await liberarFurgonViaje(elemento.id, furgonId);
      await Swal.fire({ title: "Furgón liberado", icon: "success", confirmButtonColor: "#4161bd" });
      if (reload) await reload();
    } catch (error) {
      await Swal.fire({
        title: "No se pudo liberar el furgón",
        text: error?.message || "No hemos podido procesar la solicitud.",
        icon: "error",
        confirmButtonColor: "#4161bd",
      });
    }
  };

  const handleImprimir = async () => {
    if (esCruce) {
      await handleImprimirCruce(elemento);
      return;
    }
    await generarDocumentos("pdf", elemento, imgPlantilla, true);
  }

  const handleImprimirCruce = async (cruce) => {
    const viajeCruce = esViaje
      ? elemento
      : viajes.find((viaje) => String(viaje.id) === String(cruce.viaje));
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
        ...(viajeCruce || {}),
        id: viajeCruce?.id || cruce.viaje || "-",
        fecha: viajeCruce?.fecha || cruce.fecha,
        persona: cruce.persona,
        tractor: cruce.tractor,
        furgon: cruce.furgon,
        personaCompleta:
          personaCruce?.label || cruce.personaCompleta || "-",
        tractorCompleto:
          tractorCruce?.label || cruce.tractorCompleto || "-",
        furgonCompleto:
          furgonesCruce.map((furgon) => furgon.label).join(", ") ||
          cruce.furgonCompleto ||
          "-",
      },
      cruce,
    );
  };
  
  return (
    <div className="ficha">
      <div className="ficha-content">
        {elemento.anulado === true && (
          <div className="ficha-anulada">
            <strong>ANULADO</strong>
            {elemento.motivoAnulacion && <span>{elemento.motivoAnulacion}</span>}
          </div>
        )}
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

        {esViaje && (
          <>
            <label><strong className="ficha-info-title">Recursos actuales</strong></label>
            <div className="ficha-info-box">
              <div className="ficha-info viaje-recurso">
                <span>Chofer: {elemento.personaCompleta || elemento.persona || "-"}</span>
              </div>
              <div className="ficha-info viaje-recurso">
                <span>Tractor: {elemento.tractorCompleto || elemento.tractor || "Sin tractor asignado"}</span>
                {puedeGestionarRecursos && elemento.tractor && (
                  <TextButton mini text="Liberar" onClick={handleLiberarTractor} />
                )}
                {puedeGestionarRecursos && !elemento.tractor && (
                  <TextButton mini text="Asignar" onClick={handleAsignarTractor} />
                )}
              </div>
              {idsFurgonesViaje.map((furgonId) => {
                const furgon = furgones.find((item) => String(item.id) === furgonId);
                return (
                  <div key={furgonId} className="ficha-info viaje-recurso">
                    <span>Furgón: {furgon?.label || furgonId}</span>
                    {puedeGestionarRecursos && (
                      <TextButton mini text="Liberar" onClick={() => handleLiberarFurgon(furgonId)} />
                    )}
                  </div>
                );
              })}
              {!idsFurgonesViaje.length && <div className="ficha-info">Sin furgones asignados</div>}
              <div className="ficha-info">
                Situación: {elemento.situacion || (elemento.tractor ? "EN_CURSO" : "ESPERANDO_TRACTOR")}
              </div>
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
              <div><span>Pendientes</span><strong>{movimientosCuenta.filter((m) => m.estado === false && m.anulado !== true).length}</strong></div>
              <div><span>Liquidados</span><strong>{movimientosCuenta.filter((m) => m.estado === true && m.anulado !== true).length}</strong></div>
              <div><span>Liquidaciones</span><strong>{liquidacionesCuenta.filter((l) => l.anulado !== true).length}</strong></div>
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
                      {movimiento.anulado === true ? "ANULADO" : movimiento.estado === true ? "Liquidado" : "Pendiente"}
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
                  {viaje.id} · {viaje.anulado === true ? "ANULADO" : viaje.estado ? "En viaje" : "Finalizado"}
                </button>
              ))}
            </div>
            <label><strong className="ficha-info-title">Movimientos</strong></label>
            <div className="ficha-info-box">
              {movimientosCuenta.length === 0 && <p>Sin movimientos registrados.</p>}
              {movimientosCuenta.map((movimiento) => (
                <div key={movimiento.id} className={`ficha-info movement-${movimiento.tipo?.toLowerCase()}`}>
                  <div className="obj-info-body"><strong>{movimiento.tipo} · {movimiento.id}</strong><span>$ {formatearMonto(movimiento.monto)}</span></div>
                  <div className="obj-info-footer">{movimiento.anulado === true ? "ANULADO" : movimiento.estado ? "Liquidado" : "Pendiente"}</div>
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

        {formEditarVisible &&
          createPortal(
            <FormGestor
              elemento={elemento}
              tipo={coleccion}
              coleccion={coleccion}
              onGuardar={handleGuardarEdicion}
              onClose={() => setFormEditarVisible(false)}
            />,
            document.body,
          )}
        {formLiquidacionVisible &&
          createPortal(
            <FormLiquidacion
              cuentaInicial={String(elemento.id)}
              onClose={() => setFormLiquidacionVisible(false)}
            />,
            document.body,
          )}
        {viajeVinculado &&
          createPortal(
            <Ficha
              elemento={viajeVinculado}
              coleccion="viajes"
              container={fichaContent.viajes}
              editable={false}
              onClose={() => setViajeVinculado(null)}
            />,
            document.body,
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
        {puedeAnular && (
          <div className="ficha-buttons">
            <TextButton text="ANULAR" variant="danger" onClick={handleAnular} />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Ficha);
