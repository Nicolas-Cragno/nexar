const fs = require("node:fs");
const path = require("node:path");
const { applicationDefault, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { analizarCarga } = require("./adelantosUtils");

const PROJECT_ID = "nexar-transcan";
const ARCHIVO = path.resolve(__dirname, "../../src/firebase/cargasMasivas/datos/cargaAdelantos.json");

const obtenerModo = (argumentos) => {
  if (argumentos.length !== 1 || !["--dry-run", "--commit"].includes(argumentos[0])) {
    throw new Error("Uso: node scripts/migracion/cargaAdelantos.js --dry-run | --commit");
  }
  return argumentos[0] === "--dry-run" ? "dry-run" : "commit";
};

const inicializarAdmin = () => {
  const proyectoEntorno = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
  if (proyectoEntorno && proyectoEntorno !== PROJECT_ID) {
    throw new Error(`El projectId del entorno es ${proyectoEntorno}; se esperaba ${PROJECT_ID}.`);
  }
  const rutaCredenciales = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (rutaCredenciales) {
    let credenciales;
    try {
      credenciales = JSON.parse(fs.readFileSync(path.resolve(rutaCredenciales), "utf8"));
    } catch (error) {
      throw new Error(`No se pudieron validar las credenciales administrativas: ${error.message}`);
    }
    if (credenciales.project_id !== PROJECT_ID) {
      throw new Error(`El projectId de las credenciales es ${credenciales.project_id || "desconocido"}; se esperaba ${PROJECT_ID}.`);
    }
  }
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  if (app.options.projectId !== PROJECT_ID) {
    throw new Error(`El projectId efectivo es ${app.options.projectId}; se esperaba ${PROJECT_ID}.`);
  }
  return getFirestore(app);
};

const leerColeccion = async (db, nombre) => {
  const snapshot = await db.collection(nombre).get();
  return new Map(snapshot.docs.map((documento) => [documento.id, documento.data()]));
};

const imprimirDetalle = (titulo, items, maximo = 20) => {
  if (!items.length) return;
  console.log(`\n${titulo} (${items.length}):`);
  console.log(JSON.stringify(items.slice(0, maximo), null, 2));
  if (items.length > maximo) console.log(`... ${items.length - maximo} registros adicionales omitidos.`);
};

const imprimirReporte = (resultado, totalFilas) => {
  const porcentaje = totalFilas === 0 ? 0 : (resultado.matches.length * 100) / totalFilas;
  console.log("\nJSON:");
  console.log(`- total filas: ${totalFilas}`);
  console.log(`- filas válidas: ${resultado.json.validas.length}`);
  console.log(`- filas inválidas: ${resultado.json.invalidas.length}`);
  console.log(`- nroAdelanto distintos: ${resultado.json.numerosDistintos}`);
  console.log(`- nroAdelanto repetidos: ${resultado.json.numerosRepetidos.length} (informativo, permitido)`);
  console.log(`- apariciones duplicadas: ${resultado.json.aparicionesDuplicadas} (informativo, permitido)`);
  console.log(`- grupos de filas idénticas duplicadas: ${resultado.json.filasDuplicadas.length}`);
  console.log("\nResolución:");
  console.log(`- filas con DNI resuelto: ${resultado.resolucion.resueltas.length}`);
  console.log(`- filas con DNI no resuelto o ambiguo: ${resultado.resolucion.noResueltas.length}`);
  console.log(`- DNI distintos resueltos: ${new Set(resultado.resolucion.resueltas.map((item) => item.persona)).size}`);
  console.log("\nFirestore:");
  console.log(`- movimientos totales: ${resultado.movimientosTotales}`);
  console.log(`- movimientos tipo PAGO: ${resultado.pagosTotales}`);
  console.log("\nMatching:");
  console.log(`- coincidencias únicas: ${resultado.matches.length}`);
  console.log(`- sin coincidencia: ${resultado.sinCoincidencia.length}`);
  console.log(`- coincidencias múltiples: ${resultado.coincidenciasMultiples.length}`);
  console.log(`- filas omitidas sin actualización: ${resultado.sinCoincidencia.length + resultado.coincidenciasMultiples.length + resultado.resolucion.noResueltas.length}`);
  console.log(`- porcentaje de match: ${porcentaje.toFixed(6)}%`);
  console.log(`- grupos de filas que apuntan al mismo movimiento: ${resultado.filasMismoMovimiento.length}`);
  console.log("\nEstado nroAdelanto:");
  console.log(`- documentos candidatos a actualizar: ${new Set(resultado.candidatos.map((item) => item.movimientoId)).size}`);
  console.log(`- documentos ya aplicados/sin cambio: ${new Set(resultado.yaAplicados.map((item) => item.movimientoId)).size}`);
  console.log(`- conflictos sobre el mismo movimiento: ${resultado.conflictosMismoMovimiento.length}`);
  console.log(`- valores existentes incompatibles: ${resultado.conflictosExistentes.length}`);
  console.log("\nContadores:");
  for (const item of resultado.comparacionContadores) {
    console.log(`- ${item.ubicacion}: máximo histórico=${item.maximoHistorico}, contador actual=${item.contadorActual ?? "inválido/ausente"}, recomendado=${item.recomendado}, estado=${item.contadorValido ? "OK" : "BLOQUEO PARA NUEVAS ALTAS"}`);
  }

  const muestra = resultado.matches.slice(0, 10).map((item) => ({
    nroAdelanto: item.nroAdelanto,
    dni: item.persona,
    cuentaCorrienteId: item.cuentaCorrienteId,
    fecha: item.fecha,
    monto: item.monto,
    movimientoId: item.movimientoId,
  }));
  imprimirDetalle("Muestra de matches", muestra, 10);
  imprimirDetalle("Filas inválidas", resultado.json.invalidas);
  imprimirDetalle("Filas idénticas duplicadas", resultado.json.filasDuplicadas);
  imprimirDetalle("DNI no resueltos o ambiguos", resultado.resolucion.noResueltas);
  imprimirDetalle("Filas sin coincidencia", resultado.sinCoincidencia);
  imprimirDetalle("Coincidencias múltiples", resultado.coincidenciasMultiples);
  imprimirDetalle("Filas que apuntan al mismo movimiento", resultado.filasMismoMovimiento);
  imprimirDetalle("Conflictos sobre el mismo movimiento", resultado.conflictosMismoMovimiento);
  imprimirDetalle("Valores existentes incompatibles", resultado.conflictosExistentes);
  console.log(`\nCARGA PARCIAL HISTÓRICA ADELANTOS VÁLIDA: ${resultado.valido ? "SI" : "NO"}`);
  console.log(`MATCH 100%: ${resultado.match100 ? "SI" : "NO"}`);
  console.log(`CONTADORES ADELANTOS VÁLIDOS: ${resultado.contadoresValidos ? "SI" : "NO"}`);
  console.log(`LISTO PARA COMMIT PARCIAL: ${resultado.valido ? "SI" : "NO"}`);
};

const ejecutarCommit = async (db, resultado) => {
  if (!resultado.valido) throw new Error("Commit bloqueado: la validación histórica no es válida.");
  const operaciones = [...new Map(resultado.candidatos.map((item) => [item.movimientoId, item])).values()];
  console.log(`Documentos a actualizar: ${operaciones.length}`);
  for (let inicio = 0; inicio < operaciones.length; inicio += 400) {
    const batch = db.batch();
    for (const operacion of operaciones.slice(inicio, inicio + 400)) {
      batch.set(db.collection("movimientos").doc(operacion.movimientoId), { nroAdelanto: operacion.nroAdelanto }, { merge: true });
    }
    await batch.commit();
  }
  console.log("COMMIT HISTÓRICO COMPLETADO");
};

const main = async (argumentos = process.argv.slice(2)) => {
  const modo = obtenerModo(argumentos);
  const filas = JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
  const db = inicializarAdmin();
  const [cuentas, movimientos, contadorSnapshot] = await Promise.all([
    leerColeccion(db, "cuentaCorriente"),
    leerColeccion(db, "movimientos"),
    db.collection("contadores").doc("adelantos").get(),
  ]);
  const contadorAdelantos = contadorSnapshot.exists ? contadorSnapshot.data() : null;
  const resultado = analizarCarga({ filas, cuentas, movimientos, contadorAdelantos });

  console.log(`Proyecto: ${PROJECT_ID}`);
  if (modo === "dry-run") {
    console.log("MODO: DRY RUN");
    console.log("NO SE REALIZARÁN ESCRITURAS");
  } else {
    console.log("MODO: COMMIT");
  }
  imprimirReporte(resultado, Array.isArray(filas) ? filas.length : 0);
  if (modo === "commit") await ejecutarCommit(db, resultado);
  return resultado;
};

module.exports = { ejecutarCommit, imprimirReporte, main, obtenerModo };

if (require.main === module) {
  main().catch((error) => {
    console.error(`[CARGA ADELANTOS ABORTADA] ${error.message}`);
    process.exitCode = 1;
  });
}
