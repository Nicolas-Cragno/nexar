import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const CUIT_TRANSCAN = "33719349949";

const cuentasMovimiento = (tipo, cuenta) => {
  if (["COBRO", "GASTO"].includes(tipo)) return { suma: CUIT_TRANSCAN, resta: cuenta };
  if (["ADELANTO", "PAGO"].includes(tipo)) return { suma: cuenta, resta: CUIT_TRANSCAN };
  throw new Error(`Tipo de movimiento no valido: ${tipo || "SIN TIPO"}.`);
};

export const TIPOS_ANULABLES = ["movimientos", "viajes", "cruces", "liquidaciones"];

export const permisoAnulacion = (tipo) => ({
  movimientos: "movimientosWrite",
  viajes: "viajesWrite",
  cruces: "crucesWrite",
  liquidaciones: "liquidacionesWrite",
})[tipo] || null;

export const validarMotivoAnulacion = (motivo) => {
  const normalizado = String(motivo ?? "").trim();
  if (!normalizado) throw new Error("El motivo de anulacion es obligatorio.");
  return normalizado;
};

export const impactoMovimiento = (tipo, monto) => {
  const valor = Number(monto);
  if (!Number.isFinite(valor) || valor <= 0) throw new Error("El movimiento tiene un monto invalido.");
  if (["ADELANTO", "PAGO"].includes(tipo)) return valor;
  if (["COBRO", "GASTO"].includes(tipo)) return -valor;
  throw new Error(`Tipo de movimiento no valido: ${tipo || "SIN TIPO"}.`);
};

export const recursoPerteneceAlViaje = (recurso, viajeId) =>
  String(recurso?.viajeActivo || "") === String(viajeId);

export const movimientoPuedeAnularse = (movimiento) =>
  movimiento?.anulado !== true &&
  movimiento?.estado !== true &&
  !movimiento?.liquidacion &&
  movimiento?.esCierreLiquidacion !== true;

export const movimientosRestaurables = (movimientos, liquidacionId) =>
  movimientos.every((movimiento) =>
    movimiento?.anulado !== true &&
    movimiento?.estado === true &&
    String(movimiento?.liquidacion || "") === String(liquidacionId)
  );

const datosUsuario = (usuario) => ({
  usuarioAnulacion: String(usuario?.id || usuario?.uid || ""),
  uidAnulacion: String(usuario?.uid || ""),
});

const camposAnulacion = (motivo, usuario, anulacionId) => ({
  anulado: true,
  fechaAnulacion: serverTimestamp(),
  motivoAnulacion: motivo,
  anulacion: anulacionId,
  ...datosUsuario(usuario),
});

const registroAuditoria = ({ tipo, id, motivo, usuario, efectos, referencias = {} }) => ({
  tipoOperacion: tipo,
  operacionId: String(id),
  fecha: serverTimestamp(),
  motivo,
  efectosRevertidos: efectos,
  referencias,
  ...datosUsuario(usuario),
});

const exigirNoAnulado = (datos, etiqueta) => {
  if (datos.anulado === true) throw new Error(`${etiqueta} ya se encuentra anulada.`);
};

export const anularMovimiento = async ({ id, motivo, usuario }) => {
  const motivoNormalizado = validarMotivoAnulacion(motivo);
  const movimientoRef = doc(db, "movimientos", String(id));
  const anulacionId = `movimientos_${id}`;
  const anulacionRef = doc(db, "anulaciones", anulacionId);

  return runTransaction(db, async (transaction) => {
    const movimientoSnap = await transaction.get(movimientoRef);
    if (!movimientoSnap.exists()) throw new Error(`No existe el movimiento ${id}.`);
    const movimiento = movimientoSnap.data();
    exigirNoAnulado(movimiento, "El movimiento");
    if (!movimientoPuedeAnularse(movimiento)) {
      if (movimiento.esCierreLiquidacion) {
        throw new Error("El movimiento de cierre solo puede revertirse anulando su liquidacion.");
      }
      throw new Error("Un movimiento liquidado no puede anularse individualmente.");
    }

    const cuenta = String(movimiento.cuenta || movimiento.persona || "");
    const impacto = impactoMovimiento(movimiento.tipo, movimiento.monto);
    const cuentaRef = doc(db, "cuentaCorriente", cuenta);
    const transcanRef = doc(db, "cuentaCorriente", CUIT_TRANSCAN);
    const cuentaSnap = await transaction.get(cuentaRef);
    const transcanSnap = await transaction.get(transcanRef);
    const anulacionSnap = await transaction.get(anulacionRef);
    if (!cuentaSnap.exists() || !transcanSnap.exists()) throw new Error("No existen todas las cuentas necesarias para revertir el movimiento.");
    if (anulacionSnap.exists()) throw new Error("La anulacion del movimiento ya fue registrada.");

    transaction.update(cuentaRef, { monto: increment(-impacto), ultimaModificacion: serverTimestamp() });
    transaction.update(transcanRef, { monto: increment(impacto), ultimaModificacion: serverTimestamp() });
    transaction.update(movimientoRef, camposAnulacion(motivoNormalizado, usuario, anulacionId));
    transaction.set(anulacionRef, registroAuditoria({
      tipo: "movimientos", id, motivo: motivoNormalizado, usuario,
      efectos: { saldosRevertidos: true, impactoCuenta: -impacto, impactoTranscan: impacto },
      referencias: { cuenta, viaje: movimiento.viaje || null, nroAdelanto: movimiento.nroAdelanto || null },
    }));
    return true;
  });
};

export const anularCruce = async ({ id, motivo, usuario }) => {
  const motivoNormalizado = validarMotivoAnulacion(motivo);
  const cruceRef = doc(db, "cruces", String(id));
  const anulacionId = `cruces_${id}`;
  const anulacionRef = doc(db, "anulaciones", anulacionId);
  return runTransaction(db, async (transaction) => {
    const [cruceSnap, anulacionSnap] = await Promise.all([
      transaction.get(cruceRef), transaction.get(anulacionRef),
    ]);
    if (!cruceSnap.exists()) throw new Error(`No existe el cruce ${id}.`);
    exigirNoAnulado(cruceSnap.data(), "El cruce");
    if (anulacionSnap.exists()) throw new Error("La anulacion del cruce ya fue registrada.");
    transaction.update(cruceRef, camposAnulacion(motivoNormalizado, usuario, anulacionId));
    transaction.set(anulacionRef, registroAuditoria({
      tipo: "cruces", id, motivo: motivoNormalizado, usuario,
      efectos: { cruceAnulado: true }, referencias: { viaje: cruceSnap.data().viaje || null },
    }));
    return true;
  });
};

export const anularViaje = async ({ id, motivo, usuario }) => {
  const motivoNormalizado = validarMotivoAnulacion(motivo);
  const crucesSnapshot = await getDocs(query(collection(db, "cruces"), where("viaje", "==", String(id))));
  const crucesRefs = crucesSnapshot.docs.map((item) => doc(db, "cruces", item.id));
  const viajeRef = doc(db, "viajes", String(id));
  const anulacionId = `viajes_${id}`;
  const anulacionRef = doc(db, "anulaciones", anulacionId);

  return runTransaction(db, async (transaction) => {
    const viajeSnap = await transaction.get(viajeRef);
    if (!viajeSnap.exists()) throw new Error(`No existe el viaje ${id}.`);
    const viaje = viajeSnap.data();
    exigirNoAnulado(viaje, "El viaje");
    const anulacionSnap = await transaction.get(anulacionRef);
    if (anulacionSnap.exists()) throw new Error("La anulacion del viaje ya fue registrada.");

    const recursos = viaje.estado === true ? [
      { tipo: "personas", id: String(viaje.persona) },
      ...(viaje.tractor ? [{ tipo: "tractores", id: String(viaje.tractor) }] : []),
      ...(Array.isArray(viaje.furgon) ? viaje.furgon : viaje.furgon ? [viaje.furgon] : [])
        .map((recursoId) => ({ tipo: "furgones", id: String(recursoId) })),
    ] : [];
    const recursosLeidos = [];
    for (const recurso of recursos) {
      const ref = doc(db, recurso.tipo, recurso.id);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error(`No existe el recurso ${recurso.tipo}/${recurso.id}.`);
      recursosLeidos.push({ ...recurso, ref, datos: snap.data() });
    }
    const crucesLeidos = [];
    for (const ref of crucesRefs) crucesLeidos.push({ ref, snap: await transaction.get(ref) });

    transaction.update(viajeRef, camposAnulacion(motivoNormalizado, usuario, anulacionId));
    const liberados = [];
    recursosLeidos.forEach((recurso) => {
      if (!recursoPerteneceAlViaje(recurso.datos, id)) return;
      transaction.update(recurso.ref, { enViaje: false, viajeActivo: null, ultimaModificacion: serverTimestamp() });
      liberados.push(`${recurso.tipo}/${recurso.id}`);
    });
    const crucesAnulados = [];
    crucesLeidos.forEach(({ ref, snap }) => {
      if (!snap.exists() || snap.data().anulado === true) return;
      const cruceAnulacionId = `cruces_${snap.id}`;
      const motivoCruce = `Anulado por anulacion del viaje ${id}: ${motivoNormalizado}`;
      transaction.update(ref, camposAnulacion(motivoCruce, usuario, cruceAnulacionId));
      transaction.set(doc(db, "anulaciones", cruceAnulacionId), registroAuditoria({
        tipo: "cruces", id: snap.id, motivo: motivoCruce, usuario,
        efectos: { cruceAnulado: true, automaticoPorViaje: true }, referencias: { viaje: String(id), anulacionViaje: anulacionId },
      }));
      crucesAnulados.push(snap.id);
    });
    transaction.set(anulacionRef, registroAuditoria({
      tipo: "viajes", id, motivo: motivoNormalizado, usuario,
      efectos: { viajeAnulado: true, recursosLiberados: liberados, crucesAnulados },
      referencias: { movimientosPreservados: true },
    }));
    return true;
  });
};

export const anularLiquidacion = async ({ id, motivo, usuario }) => {
  const motivoNormalizado = validarMotivoAnulacion(motivo);
  const liquidacionRef = doc(db, "liquidaciones", String(id));
  const anulacionId = `liquidaciones_${id}`;
  const anulacionRef = doc(db, "anulaciones", anulacionId);

  return runTransaction(db, async (transaction) => {
    const liquidacionSnap = await transaction.get(liquidacionRef);
    if (!liquidacionSnap.exists()) throw new Error(`No existe la liquidacion ${id}.`);
    const liquidacion = liquidacionSnap.data();
    exigirNoAnulado(liquidacion, "La liquidacion");
    const movimientoIds = Array.isArray(liquidacion.movimientos) ? liquidacion.movimientos.map(String) : [];
    if (!movimientoIds.length) throw new Error("La liquidacion no contiene movimientos originales.");
    const movimientosLeidos = [];
    for (const movimientoId of movimientoIds) {
      const ref = doc(db, "movimientos", movimientoId);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error(`No existe el movimiento ${movimientoId}.`);
      movimientosLeidos.push({ ref, snap });
    }
    const cierreRef = liquidacion.movimientoCierre ? doc(db, "movimientos", String(liquidacion.movimientoCierre)) : null;
    const cierreSnap = cierreRef ? await transaction.get(cierreRef) : null;
    const anulacionSnap = await transaction.get(anulacionRef);
    if (anulacionSnap.exists()) throw new Error("La anulacion de la liquidacion ya fue registrada.");

    if (!movimientosRestaurables(movimientosLeidos.map(({ snap }) => snap.data()), id)) {
      throw new Error("Uno de los movimientos fue afectado por una operacion posterior incompatible.");
    }
    if (cierreRef && (!cierreSnap?.exists() || cierreSnap.data().anulado === true || String(cierreSnap.data().liquidacion || "") !== String(id))) {
      throw new Error("El movimiento de cierre no puede revertirse consistentemente.");
    }

    let montoCierre = 0;
    let cuenta = String(liquidacion.cuenta || liquidacion.persona || "");
    let cuentaRef = null;
    let transcanRef = null;
    if (cierreSnap?.exists()) {
      const cierre = cierreSnap.data();
      montoCierre = Number(cierre.monto);
      impactoMovimiento(cierre.tipo, montoCierre);
      const cuentas = cuentasMovimiento(cierre.tipo, cuenta);
      cuentaRef = doc(db, "cuentaCorriente", String(cuentas.suma));
      transcanRef = doc(db, "cuentaCorriente", String(cuentas.resta));
      const cuentaSnap = await transaction.get(cuentaRef);
      const transcanSnap = await transaction.get(transcanRef);
      if (!cuentaSnap.exists() || !transcanSnap.exists()) throw new Error("No existen todas las cuentas necesarias para revertir la liquidacion.");
    }

    movimientosLeidos.forEach(({ ref }) => transaction.update(ref, {
      estado: false,
      liquidacion: null,
      fechaLiquidacion: null,
      liquidacionAnterior: String(id),
      ultimaModificacion: serverTimestamp(),
    }));
    if (cierreRef) {
      transaction.update(cierreRef, {
        ...camposAnulacion(motivoNormalizado, usuario, anulacionId),
        revertidoPorAnulacionLiquidacion: true,
      });
      transaction.update(cuentaRef, { monto: increment(-montoCierre), ultimaModificacion: serverTimestamp() });
      transaction.update(transcanRef, { monto: increment(montoCierre), ultimaModificacion: serverTimestamp() });
    }
    transaction.update(liquidacionRef, camposAnulacion(motivoNormalizado, usuario, anulacionId));
    transaction.set(anulacionRef, registroAuditoria({
      tipo: "liquidaciones", id, motivo: motivoNormalizado, usuario,
      efectos: { movimientosReabiertos: movimientoIds, movimientoCierreRevertido: liquidacion.movimientoCierre || null, montoCierreRevertido: montoCierre },
      referencias: { cuenta, movimientoCierre: liquidacion.movimientoCierre || null },
    }));
    return true;
  });
};

export const anuladores = {
  movimientos: anularMovimiento,
  viajes: anularViaje,
  cruces: anularCruce,
  liquidaciones: anularLiquidacion,
};
