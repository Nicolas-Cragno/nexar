const fs = require("node:fs");
const path = require("node:path");
const { applicationDefault, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { analizarCarga, normalizarFechaMovimiento } = require("./adelantosUtils");

const PROJECT_ID = "nexar-transcan";
const ARCHIVO = path.resolve(__dirname, "../../src/firebase/cargasMasivas/datos/cargaAdelantos.json");
const DIA_MS = 24 * 60 * 60 * 1000;

const validarProyecto = () => {
  const proyectoEntorno = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  if (proyectoEntorno && proyectoEntorno !== PROJECT_ID) {
    throw new Error(`El projectId del entorno es ${proyectoEntorno}; se esperaba ${PROJECT_ID}.`);
  }
  const rutaCredenciales = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!rutaCredenciales) throw new Error("GOOGLE_APPLICATION_CREDENTIALS no está configurada.");
  const credenciales = JSON.parse(fs.readFileSync(path.resolve(rutaCredenciales), "utf8"));
  if (credenciales.project_id !== PROJECT_ID) {
    throw new Error(`El projectId de las credenciales es ${credenciales.project_id || "desconocido"}; se esperaba ${PROJECT_ID}.`);
  }
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  return getFirestore(app);
};

const leerColeccion = async (db, nombre) => {
  const snapshot = await db.collection(nombre).get();
  return new Map(snapshot.docs.map((documento) => [documento.id, documento.data()]));
};

const diasEntre = (origen, destino) => Math.round((Date.parse(`${destino}T00:00:00Z`) - Date.parse(`${origen}T00:00:00Z`)) / DIA_MS);
const mes = (fecha) => fecha.slice(0, 7);
const rango = (items, obtenerFecha) => {
  const fechas = items.map(obtenerFecha).filter(Boolean).sort();
  return { minima: fechas[0] || null, maxima: fechas.at(-1) || null };
};

const serializarMovimiento = (movimiento, fechaJson, montoJson, incluirDatos = false) => {
  const fecha = normalizarFechaMovimiento(movimiento.fecha);
  const base = {
    movimientoId: movimiento.id,
    persona: movimiento.persona,
    fecha,
    diferenciaDias: fecha ? diasEntre(fechaJson, fecha) : null,
    monto: movimiento.monto,
    diferenciaMonto: typeof movimiento.monto === "number" ? movimiento.monto - montoJson : null,
    tipo: movimiento.tipo,
  };
  if (!incluirDatos) return base;
  return {
    ...Object.fromEntries(Object.entries(movimiento).map(([clave, valor]) => [
      clave,
      clave === "fecha" ? fecha : valor,
    ])),
    ...base,
  };
};

const diagnosticar = ({ filas, cuentas, movimientos, contadorAdelantos }) => {
  const oficial = analizarCarga({ filas, cuentas, movimientos, contadorAdelantos });
  const movimientosNormalizados = [...movimientos.entries()].map(([id, datos]) => ({
    id: String(id),
    ...datos,
    fechaNormalizada: normalizarFechaMovimiento(datos.fecha),
  }));
  const porPersona = new Map();
  for (const movimiento of movimientosNormalizados) {
    const persona = String(movimiento.persona ?? "").trim();
    if (!porPersona.has(persona)) porPersona.set(persona, []);
    porPersona.get(persona).push(movimiento);
  }

  const diagnosticos = oficial.sinCoincidencia.map((fila) => {
    const personales = porPersona.get(fila.cuentaCorrienteId) || [];
    const mismaPersonaMonto = personales.filter((movimiento) => movimiento.monto === fila.monto);
    const mismaPersonaFecha = personales.filter((movimiento) => movimiento.fechaNormalizada === fila.fecha);
    const exactosOtroTipo = mismaPersonaFecha.filter((movimiento) => movimiento.monto === fila.monto && movimiento.tipo !== "PAGO");
    const candidatosVentana = mismaPersonaMonto
      .filter((movimiento) => movimiento.fechaNormalizada)
      .map((movimiento) => ({ movimiento, delta: diasEntre(fila.fecha, movimiento.fechaNormalizada) }))
      .filter((item) => Math.abs(item.delta) <= 7);
    const cercanos = personales
      .filter((movimiento) => movimiento.fechaNormalizada)
      .map((movimiento) => ({
        movimiento,
        delta: diasEntre(fila.fecha, movimiento.fechaNormalizada),
        diferenciaMonto: typeof movimiento.monto === "number" ? movimiento.monto - fila.monto : null,
      }))
      .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta)
        || Math.abs(a.diferenciaMonto ?? Infinity) - Math.abs(b.diferenciaMonto ?? Infinity));

    const superposiciones = [];
    if (mismaPersonaMonto.some((movimiento) => movimiento.fechaNormalizada !== fila.fecha)) superposiciones.push("A");
    if (mismaPersonaFecha.some((movimiento) => movimiento.monto !== fila.monto)) superposiciones.push("B");
    if (exactosOtroTipo.length) superposiciones.push("C");
    if (candidatosVentana.length > 1) superposiciones.push("D");
    if (personales.length && !superposiciones.length) superposiciones.push("E");
    if (!personales.length) superposiciones.push("F");

    let categoria;
    if (exactosOtroTipo.length) categoria = "C";
    else if (candidatosVentana.length === 1) categoria = "A";
    else if (candidatosVentana.length > 1) categoria = "D";
    else if (mismaPersonaFecha.length) categoria = "B";
    else if (mismaPersonaMonto.length) categoria = "A";
    else if (personales.length) categoria = "E";
    else categoria = "F";

    return {
      fila,
      personales,
      mismaPersonaMonto,
      mismaPersonaFecha,
      exactosOtroTipo,
      candidatosVentana,
      cercanos,
      categoria,
      superposiciones,
    };
  });

  return { oficial, diagnosticos, movimientosNormalizados };
};

const incrementar = (objeto, clave) => { objeto[clave] = (objeto[clave] || 0) + 1; };

const imprimir = ({ oficial, diagnosticos, movimientosNormalizados }) => {
  const categorias = {};
  const superposiciones = {};
  const deltas = {};
  const tiposExactos = {};
  const montosDiferentes = {};
  const ventanas = { 1: 0, 2: 0, 3: 0, 7: 0 };
  const detalleVentanas = Object.fromEntries(Object.keys(ventanas).map((ventana) => [ventana, { sinCandidato: 0, candidatoUnico: 0, candidatosMultiples: 0 }]));
  let mismaPersonaMontoOtraFecha = 0;
  let mismaPersonaFechaOtroMonto = 0;
  let montosDecimales = 0;
  let montosCero = 0;

  for (const diagnostico of diagnosticos) {
    incrementar(categorias, diagnostico.categoria);
    incrementar(superposiciones, diagnostico.superposiciones.sort().join("+") || "ninguna");
    if (diagnostico.mismaPersonaMonto.some((movimiento) => movimiento.fechaNormalizada !== diagnostico.fila.fecha)) mismaPersonaMontoOtraFecha += 1;
    const otrosMontos = diagnostico.mismaPersonaFecha.filter((movimiento) => movimiento.monto !== diagnostico.fila.monto);
    if (otrosMontos.length) mismaPersonaFechaOtroMonto += 1;
    for (const movimiento of otrosMontos) {
      const diferencia = Number(movimiento.monto) - diagnostico.fila.monto;
      incrementar(montosDiferentes, String(diferencia));
      if (!Number.isInteger(diferencia)) montosDecimales += 1;
      if (movimiento.monto === 0) montosCero += 1;
    }
    for (const movimiento of diagnostico.exactosOtroTipo) incrementar(tiposExactos, movimiento.tipo || "SIN TIPO");
    const deltasFila = new Set(diagnostico.candidatosVentana.map((item) => item.delta));
    for (const delta of deltasFila) incrementar(deltas, String(delta));
    for (const ventana of Object.keys(ventanas).map(Number)) {
      const cantidad = diagnostico.candidatosVentana.filter((item) => Math.abs(item.delta) <= ventana).length;
      if (cantidad > 0) ventanas[ventana] += 1;
      if (cantidad === 0) detalleVentanas[ventana].sinCandidato += 1;
      else if (cantidad === 1) detalleVentanas[ventana].candidatoUnico += 1;
      else detalleVentanas[ventana].candidatosMultiples += 1;
    }
  }

  const candidatosMenosUno = diagnosticos.map((diagnostico) => ({
    fila: diagnostico.fila.fila,
    candidatos: diagnostico.candidatosVentana.filter((item) => item.delta === -1),
  }));
  const unicosMenosUno = candidatosMenosUno.filter((item) => item.candidatos.length === 1);
  const usosMenosUno = new Map();
  for (const item of unicosMenosUno) {
    const id = item.candidatos[0].movimiento.id;
    if (!usosMenosUno.has(id)) usosMenosUno.set(id, []);
    usosMenosUno.get(id).push(item.fila);
  }
  const colisionesMenosUno = [...usosMenosUno.entries()]
    .filter(([, filas]) => filas.length > 1)
    .map(([movimientoId, filas]) => ({ movimientoId, filas }));
  const movimientosMatchOficial = new Set(oficial.matches.map((item) => item.movimientoId));
  const colisionesConMatchOficial = unicosMenosUno
    .filter((item) => movimientosMatchOficial.has(item.candidatos[0].movimiento.id))
    .map((item) => ({ fila: item.fila, movimientoId: item.candidatos[0].movimiento.id }));
  const detalleMenosUno = {
    filasConCandidato: candidatosMenosUno.filter((item) => item.candidatos.length > 0).length,
    candidatoUnico: unicosMenosUno.length,
    candidatosMultiples: candidatosMenosUno.filter((item) => item.candidatos.length > 1).length,
    candidatosUnicosSinColisionGlobal: unicosMenosUno.filter((item) => usosMenosUno.get(item.candidatos[0].movimiento.id).length === 1).length,
    colisionesSobreMismoMovimiento: colisionesMenosUno.length,
    colisionesConMatchesOficiales: colisionesConMatchOficial.length,
  };

  const periodos = {};
  for (const fila of oficial.json.validas) {
    if (!periodos[mes(fila.fecha)]) periodos[mes(fila.fecha)] = { json: 0, match: 0, sinMatch: 0, ambiguo: 0 };
    periodos[mes(fila.fecha)].json += 1;
  }
  for (const item of oficial.matches) periodos[mes(item.fecha)].match += 1;
  for (const item of oficial.sinCoincidencia) periodos[mes(item.fecha)].sinMatch += 1;
  for (const item of oficial.coincidenciasMultiples) periodos[mes(item.fecha)].ambiguo += 1;

  console.log(`Proyecto: ${PROJECT_ID}`);
  console.log("MODO: DIAGNÓSTICO READ-ONLY");
  console.log("NO SE REALIZARÁN ESCRITURAS");
  console.log("\nResumen oficial:");
  console.log(JSON.stringify({ filas: oficial.json.validas.length, matches: oficial.matches.length, sinMatch: oficial.sinCoincidencia.length, ambiguos: oficial.coincidenciasMultiples.length }, null, 2));
  console.log("\nRangos:");
  console.log(JSON.stringify({ json: rango(oficial.json.validas, (item) => item.fecha), matches: rango(oficial.matches, (item) => item.fecha), sinMatch: rango(oficial.sinCoincidencia, (item) => item.fecha) }, null, 2));
  console.log("\nDistribución temporal:");
  console.table(Object.entries(periodos).map(([periodo, datos]) => ({ periodo, ...datos, porcentajeMatch: `${((datos.match / datos.json) * 100).toFixed(2)}%` })));
  console.log("\nCriterios relajados sobre no-match:");
  console.log(JSON.stringify({ mismaPersonaMontoOtraFecha, mismaPersonaFechaOtroMonto, exactosConOtroTipo: Object.values(tiposExactos).reduce((a, b) => a + b, 0), porTipoExacto: tiposExactos, candidatosVentana: ventanas, detalleVentanas, detalleDeltaMenosUno: detalleMenosUno, distribucionDeltaDias: Object.fromEntries(Object.entries(deltas).sort(([a], [b]) => Number(a) - Number(b))), diferenciasMontoMasFrecuentes: Object.entries(montosDiferentes).sort((a, b) => b[1] - a[1]).slice(0, 20), diferenciasDecimales: montosDecimales, candidatosMontoCero: montosCero }, null, 2));
  if (colisionesMenosUno.length) console.log(`Colisiones de candidatos únicos a -1 día: ${JSON.stringify(colisionesMenosUno.slice(0, 20))}`);
  console.log("\nClasificación exclusiva:");
  console.log(JSON.stringify(categorias, null, 2));
  console.log("\nSuperposiciones:");
  console.log(JSON.stringify(superposiciones, null, 2));

  console.log("\nCasos ambiguos oficiales:");
  for (const ambiguo of oficial.coincidenciasMultiples) {
    console.log(JSON.stringify({ fila: ambiguo.fila, dni: ambiguo.persona, cuenta: ambiguo.cuentaCorrienteId, fecha: ambiguo.fecha, monto: ambiguo.monto, nroAdelanto: ambiguo.nroAdelanto, candidatos: ambiguo.movimientoIds.map((id) => serializarMovimiento(movimientosNormalizados.find((item) => item.id === id), ambiguo.fecha, ambiguo.monto, true)) }, null, 2));
  }

  const muestra = [];
  for (const categoria of ["C", "A", "D", "B", "E", "F"]) {
    for (const diagnostico of diagnosticos.filter((item) => item.categoria === categoria).slice(0, 4)) {
      muestra.push({
        categoria,
        json: { fila: diagnostico.fila.fila, dni: diagnostico.fila.persona, cuenta: diagnostico.fila.cuentaCorrienteId, fecha: diagnostico.fila.fecha, monto: diagnostico.fila.monto, nroAdelanto: diagnostico.fila.nroAdelanto },
        candidatosA: diagnostico.mismaPersonaMonto.slice(0, 10).map((item) => serializarMovimiento(item, diagnostico.fila.fecha, diagnostico.fila.monto)),
        candidatosB: diagnostico.mismaPersonaFecha.slice(0, 10).map((item) => serializarMovimiento(item, diagnostico.fila.fecha, diagnostico.fila.monto)),
        candidatoMasCercano: diagnostico.cercanos[0] ? serializarMovimiento(diagnostico.cercanos[0].movimiento, diagnostico.fila.fecha, diagnostico.fila.monto) : null,
        superposiciones: diagnostico.superposiciones,
      });
      if (muestra.length === 20) break;
    }
    if (muestra.length === 20) break;
  }
  for (const diagnostico of diagnosticos) {
    if (muestra.length === 20) break;
    if (muestra.some((item) => item.json.fila === diagnostico.fila.fila)) continue;
    muestra.push({
      categoria: diagnostico.categoria,
      json: { fila: diagnostico.fila.fila, dni: diagnostico.fila.persona, cuenta: diagnostico.fila.cuentaCorrienteId, fecha: diagnostico.fila.fecha, monto: diagnostico.fila.monto, nroAdelanto: diagnostico.fila.nroAdelanto },
      candidatosA: diagnostico.mismaPersonaMonto.slice(0, 10).map((item) => serializarMovimiento(item, diagnostico.fila.fecha, diagnostico.fila.monto)),
      candidatosB: diagnostico.mismaPersonaFecha.slice(0, 10).map((item) => serializarMovimiento(item, diagnostico.fila.fecha, diagnostico.fila.monto)),
      candidatoMasCercano: diagnostico.cercanos[0] ? serializarMovimiento(diagnostico.cercanos[0].movimiento, diagnostico.fila.fecha, diagnostico.fila.monto) : null,
      superposiciones: diagnostico.superposiciones,
    });
  }
  console.log("\nMuestra compacta:");
  console.table(muestra.map((item) => ({
    categoria: item.categoria,
    fila: item.json.fila,
    dni: item.json.dni,
    fechaJson: item.json.fecha,
    montoJson: item.json.monto,
    movimientoId: item.candidatoMasCercano?.movimientoId || "-",
    fechaMovimiento: item.candidatoMasCercano?.fecha || "-",
    deltaDias: item.candidatoMasCercano?.diferenciaDias ?? "-",
    montoMovimiento: item.candidatoMasCercano?.monto ?? "-",
    diferenciaMonto: item.candidatoMasCercano?.diferenciaMonto ?? "-",
    tipo: item.candidatoMasCercano?.tipo || "-",
  })));
  console.log("\nMuestra representativa:");
  console.log(JSON.stringify(muestra, null, 2));
};

const main = async () => {
  const db = validarProyecto();
  const filas = JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
  const [cuentas, movimientos, contadorSnapshot] = await Promise.all([
    leerColeccion(db, "cuentaCorriente"),
    leerColeccion(db, "movimientos"),
    db.collection("contadores").doc("adelantos").get(),
  ]);
  const resultado = diagnosticar({ filas, cuentas, movimientos, contadorAdelantos: contadorSnapshot.exists ? contadorSnapshot.data() : null });
  imprimir(resultado);
};

module.exports = { diagnosticar };

if (require.main === module) {
  main().catch((error) => {
    console.error(`[DIAGNÓSTICO ABORTADO] ${error.message}`);
    process.exitCode = 1;
  });
}
