const fs = require("node:fs");
const path = require("node:path");
const { applicationDefault, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { normalizarFechaMovimiento, validarFilas } = require("./adelantosUtils");
const { conciliarGrupo } = require("./conciliacionAdelantosUtils");

const PROJECT_ID = "nexar-transcan";
const ARCHIVO = path.resolve(__dirname, "../../src/firebase/cargasMasivas/datos/cargaAdelantos.json");

const inicializar = () => {
  const ruta = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!ruta) throw new Error("GOOGLE_APPLICATION_CREDENTIALS no está configurada.");
  const credenciales = JSON.parse(fs.readFileSync(path.resolve(ruta), "utf8"));
  if (credenciales.project_id !== PROJECT_ID) throw new Error("La credencial no pertenece a nexar-transcan.");
  const proyectoEntorno = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  if (proyectoEntorno && proyectoEntorno !== PROJECT_ID) throw new Error("El proyecto configurado no es nexar-transcan.");
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  return getFirestore(app);
};

const clave = (persona, monto) => JSON.stringify([String(persona), Number(monto)]);
const agregar = (mapa, llave, valor) => {
  if (!mapa.has(llave)) mapa.set(llave, []);
  mapa.get(llave).push(valor);
};

const main = async () => {
  const db = inicializar();
  const filasOriginales = JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
  const validacion = validarFilas(filasOriginales);
  if (validacion.invalidas.length) throw new Error(`Existen ${validacion.invalidas.length} filas inválidas.`);
  const [cuentasSnapshot, movimientosSnapshot] = await Promise.all([
    db.collection("cuentaCorriente").get(),
    db.collection("movimientos").get(),
  ]);
  const cuentasPorDni = new Map();
  for (const documento of cuentasSnapshot.docs) {
    const dni = String(documento.data().dni ?? "").trim();
    if (dni) agregar(cuentasPorDni, dni, documento.id);
  }

  const filasPorGrupo = new Map();
  const resultados = [];
  for (const fila of validacion.validas) {
    const cuentas = cuentasPorDni.get(fila.persona) || [];
    if (cuentas.length !== 1) {
      resultados.push({ estado: "SIN_MOVIMIENTO", fila, motivo: cuentas.length ? "DNI ambiguo" : "DNI no resuelto" });
      continue;
    }
    const resuelta = { ...fila, cuentaCorrienteId: cuentas[0] };
    agregar(filasPorGrupo, clave(cuentas[0], fila.monto), resuelta);
  }

  const movimientosPorGrupo = new Map();
  for (const documento of movimientosSnapshot.docs) {
    const movimiento = documento.data();
    if (movimiento.tipo !== "PAGO" || typeof movimiento.monto !== "number") continue;
    const fechaNormalizada = normalizarFechaMovimiento(movimiento.fecha);
    if (!fechaNormalizada) continue;
    agregar(movimientosPorGrupo, clave(movimiento.persona, movimiento.monto), {
      id: documento.id,
      ...movimiento,
      fechaNormalizada,
    });
  }

  for (const [grupo, filas] of filasPorGrupo) {
    resultados.push(...conciliarGrupo(filas, movimientosPorGrupo.get(grupo) || []).resultados);
  }

  resultados.sort((a, b) => a.fila.fila - b.fila.fila);
  const asignados = resultados.filter((item) => item.estado === "ASIGNADO");
  const sinMovimiento = resultados.filter((item) => item.estado === "SIN_MOVIMIENTO");
  const ambiguos = resultados.filter((item) => item.estado === "AMBIGUO");
  const mayoresSiete = asignados.filter((item) => item.distancia > 7);
  const distribucionFirmada = {};
  const rangos = { exacta: 0, unDia: 0, dosTres: 0, cuatroSiete: 0, ochoQuince: 0, masQuince: 0 };
  for (const item of asignados) {
    const etiqueta = item.deltaDias > 0 ? `+${item.deltaDias}` : String(item.deltaDias);
    distribucionFirmada[etiqueta] = (distribucionFirmada[etiqueta] || 0) + 1;
    if (item.distancia === 0) rangos.exacta += 1;
    else if (item.distancia === 1) rangos.unDia += 1;
    else if (item.distancia <= 3) rangos.dosTres += 1;
    else if (item.distancia <= 7) rangos.cuatroSiete += 1;
    else if (item.distancia <= 15) rangos.ochoQuince += 1;
    else rangos.masQuince += 1;
  }

  const describirFila = (item) => ({
    fila: item.fila.fila,
    dni: item.fila.persona,
    cuenta: item.fila.cuentaCorrienteId,
    fechaJson: item.fila.fecha,
    monto: item.fila.monto,
    nroAdelanto: item.fila.nroAdelanto,
    motivo: item.motivo,
    candidatos: item.candidatos,
  });
  const describirAsignado = (item) => ({
    fila: item.fila.fila,
    dni: item.fila.persona,
    cuenta: item.fila.cuentaCorrienteId,
    fechaJson: item.fila.fecha,
    monto: item.fila.monto,
    nroAdelanto: item.fila.nroAdelanto,
    movimientoId: item.movimiento.id,
    fechaMovimiento: item.movimiento.fechaNormalizada,
    deltaDias: item.deltaDias,
  });

  console.log(`Proyecto: ${PROJECT_ID}`);
  console.log("MODO: SIMULACIÓN READ-ONLY");
  console.log("NO SE REALIZARÁN ESCRITURAS");
  console.log(`\nTOTAL JSON: ${filasOriginales.length}`);
  console.log(`ASIGNADOS UNO-A-UNO: ${asignados.length}`);
  console.log(`SIN MOVIMIENTO DISPONIBLE: ${sinMovimiento.length}`);
  console.log(`AMBIGUOS REALES: ${ambiguos.length}`);
  console.log("\nDISTRIBUCIÓN POR DISTANCIA:");
  console.log(JSON.stringify(rangos, null, 2));
  console.log("\nDISTRIBUCIÓN DE DELTA FIRMADO:");
  console.log(JSON.stringify(Object.fromEntries(Object.entries(distribucionFirmada).sort(([a], [b]) => Number(a) - Number(b))), null, 2));
  console.log(`\nMÁXIMA DIFERENCIA ENCONTRADA: ${asignados.length ? Math.max(...asignados.map((item) => item.distancia)) : 0} días`);
  console.log(`\nAMBIGUOS (${ambiguos.length}):`);
  console.log(JSON.stringify(ambiguos.map(describirFila), null, 2));
  console.log(`\nSIN MOVIMIENTO (${sinMovimiento.length}):`);
  console.log(JSON.stringify(sinMovimiento.map(describirFila), null, 2));
  console.log(`\nCASOS >7 DÍAS (${mayoresSiete.length}):`);
  console.log(JSON.stringify(mayoresSiete.map(describirAsignado), null, 2));
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`[CONCILIACIÓN ABORTADA] ${error.message}`);
    process.exitCode = 1;
  });
}
