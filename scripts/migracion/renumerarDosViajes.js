const fs = require("node:fs");
const path = require("node:path");
const { isDeepStrictEqual } = require("node:util");
const { initializeApp, applicationDefault, deleteApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT = "nexar-transcan";
const MAPEO = Object.freeze({ "001-00000502": "001-00000501", "001-00000503": "001-00000502" });
const ORIGENES = Object.keys(MAPEO).map((id) => `viajes/${id}`);
const CAMPOS = new Set(["viaje", "viajeActivo"]);

// Una sola sustitucion; los tipos nativos de Firestore se conservan intactos.
function transformar(valor, ruta = [], cambios = []) {
  if (Array.isArray(valor)) return valor.map((item, i) => transformar(item, [...ruta, i], cambios));
  if (!valor || Object.getPrototypeOf(valor) !== Object.prototype) return valor;
  return Object.fromEntries(Object.entries(valor).map(([campo, item]) => {
    if (CAMPOS.has(campo) && item === "001-00000501") {
      cambios.push({ campo, ruta: [...ruta, campo], viejo: item, nuevo: item });
      return [campo, item];
    }
    if (CAMPOS.has(campo) && typeof item === "string" && Object.hasOwn(MAPEO, item)) {
      cambios.push({ campo, ruta: [...ruta, campo], viejo: item, nuevo: MAPEO[item] });
      return [campo, MAPEO[item]];
    }
    return [campo, transformar(item, [...ruta, campo], cambios)];
  }));
}

async function descubrir(db) {
  const rutas = [];
  async function visitar(col) {
    rutas.push(col.path);
    const docs = await col.listDocuments();
    for (let i = 0; i < docs.length; i += 20) {
      const grupos = await Promise.all(docs.slice(i, i + 20).map((doc) => doc.listCollections()));
      for (const sub of grupos.flat()) await visitar(sub);
    }
  }
  for (const col of await db.listCollections()) await visitar(col);
  return rutas.sort();
}

async function leer(db, tx, rutas) {
  const docs = new Map();
  for (const ruta of rutas) {
    const snap = await tx.get(db.collection(ruta));
    for (const doc of snap.docs) docs.set(doc.ref.path, doc);
  }
  return docs;
}

function preparar(docs, rutas) {
  for (const ruta of ORIGENES) {
    if (!docs.has(ruta)) throw new Error(`Falta origen ${ruta}`);
    const data = docs.get(ruta).data();
    if (Object.hasOwn(data, "id") && data.id !== ruta.split("/")[1]) throw new Error(`ID interno inconsistente en ${ruta}`);
  }
  if (docs.has("viajes/001-00000501")) throw new Error("Destino 501 ocupado; no es seguro reemplazarlo");
  for (const id of ["001-00000501", ...Object.keys(MAPEO)]) {
    if (rutas.some((ruta) => ruta.startsWith(`viajes/${id}/`))) throw new Error(`Subcolecciones en viaje ${id}`);
  }
  for (const ruta of ["viajes/001-00000500", "contadores/viajes"]) {
    if (!docs.has(ruta)) throw new Error(`Falta documento de control ${ruta}`);
  }
  const ops = new Map();
  const referencias = [];
  const conteos = Object.fromEntries(rutas.map((ruta) => [ruta, { viaje: 0, viajeActivo: 0 }]));
  for (const [ruta, snap] of docs) {
    const cambios = [];
    const data = transformar(snap.data(), [], cambios);
    if (cambios.length && ruta.split("/").includes("contadores")) throw new Error(`Referencia afectada en contador ${ruta}`);
    if (cambios.length && ORIGENES.includes(ruta)) throw new Error(`Origen ${ruta} contiene referencias: contradice copia exacta salvo id`);
    if (cambios.some((c) => c.viejo === "001-00000501")) throw new Error(`Referencia previa al destino ausente 501 en ${ruta}`);
    for (const c of cambios) {
      conteos[ruta.split("/").slice(0, -1).join("/")][c.campo]++;
      referencias.push({ documento: ruta, ...c });
    }
    if (cambios.length) ops.set(ruta, { tipo: "set", data });
  }
  // Las dos copias provienen exclusivamente de los snapshots originales.
  for (const ruta of ORIGENES) {
    const destino = `viajes/${MAPEO[ruta.split("/")[1]]}`;
    const data = { ...docs.get(ruta).data() };
    if (Object.hasOwn(data, "id")) data.id = destino.split("/")[1];
    ops.set(destino, { tipo: destino.endsWith("501") ? "create" : "set", data });
  }
  ops.set("viajes/001-00000503", { tipo: "delete" });
  if (ops.size > 500) throw new Error("Mas de 500 escrituras; abortado");
  if (ops.has("viajes/001-00000500") || [...ops.keys()].some((ruta) => ruta.split("/").includes("contadores"))) {
    throw new Error("El plan intenta escribir un documento protegido");
  }
  return { ops, reporte: { origenes: ORIGENES, referenciasPorColeccion: conteos, referencias,
    documentosModificar: ops.size, escrituras: [...ops].map(([documento, op]) => ({ documento, operacion: op.tipo })),
    contadorModificado: "NO" } };
}

function mismosSnapshots(a, b) {
  if (a.size !== b.size) return false;
  return [...a].every(([ruta, doc]) => b.has(ruta) && doc.updateTime.isEqual(b.get(ruta).updateTime));
}

async function main() {
  if (process.argv.length !== 3 || !["--dry-run", "--apply-if-safe"].includes(process.argv[2])) throw new Error("Usar --dry-run o --apply-if-safe");
  if (process.env.FIRESTORE_EMULATOR_HOST) throw new Error("Emulador configurado");
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../.firebaserc"), "utf8"));
  if (config.projects?.default !== PROJECT) throw new Error("Proyecto local incorrecto");
  for (const variable of ["GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT"]) {
    if (process.env[variable] && process.env[variable] !== PROJECT) throw new Error(`Proyecto incorrecto en ${variable}`);
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const cred = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"));
    if (cred.project_id !== PROJECT) throw new Error("Proyecto de credenciales incorrecto");
  }
  const app = initializeApp({ credential: applicationDefault(), projectId: PROJECT });
  let confirmado = false;
  try {
    const db = getFirestore(app);
    if (db.projectId !== PROJECT || app.options.projectId !== PROJECT) throw new Error("Proyecto efectivo incorrecto");
    await app.options.credential.getAccessToken();
    console.log(`Proyecto validado: ${PROJECT}`);
    const rutas = await descubrir(db);
    console.log(`Colecciones y subcolecciones descubiertas: ${rutas.length}`);
    const originales = await db.runTransaction((tx) => leer(db, tx, rutas), { readOnly: true });
    const plan = preparar(originales, rutas);
    console.log(JSON.stringify({ modo: "DRY-RUN", ...plan.reporte, escriturasRealizadas: 0 }, null, 2));
    if (process.argv[2] === "--dry-run") return;
    const rutasActuales = await descubrir(db);
    if (!isDeepStrictEqual(rutas, rutasActuales)) throw new Error("Cambio de colecciones durante dry-run");
    await db.runTransaction(async (tx) => {
      const actuales = await leer(db, tx, rutas);
      if (!mismosSnapshots(originales, actuales)) throw new Error("Datos cambiaron desde el dry-run; no se escribe");
      const validado = preparar(actuales, rutas);
      if (!isDeepStrictEqual(plan.reporte, validado.reporte)) throw new Error("Plan cambio desde dry-run");
      for (const [ruta, op] of validado.ops) {
        const ref = db.doc(ruta);
        if (op.tipo === "delete") tx.delete(ref);
        else if (op.tipo === "create") tx.create(ref, op.data);
        else tx.set(ref, op.data);
      }
    }, { maxAttempts: 1 });
    confirmado = true;
    console.log(`COMMIT confirmado: ${plan.ops.size} escrituras`);
    const rutasFinales = await descubrir(db);
    const finales = await db.runTransaction((tx) => leer(db, tx, rutasFinales), { readOnly: true });
    const errores = [];
    for (const [ruta, op] of plan.ops) {
      if (op.tipo === "delete") {
        if (finales.has(ruta)) errores.push(`Documento no eliminado: ${ruta}`);
      } else if (!finales.has(ruta) || !isDeepStrictEqual(finales.get(ruta).data(), op.data)) errores.push(`Datos no coinciden: ${ruta}`);
    }
    let referencias503 = 0;
    for (const snap of finales.values()) {
      const cambios = [];
      transformar(snap.data(), [], cambios);
      referencias503 += cambios.filter((c) => c.viejo === "001-00000503").length;
    }
    if (referencias503) errores.push(`Referencias restantes a 503: ${referencias503}`);
    for (const ruta of ["viajes/001-00000500", "contadores/viajes"]) {
      if (!finales.has(ruta) || !isDeepStrictEqual(finales.get(ruta).data(), originales.get(ruta).data()) ||
          !finales.get(ruta).updateTime.isEqual(originales.get(ruta).updateTime)) errores.push(`Documento de control cambio: ${ruta}`);
    }
    console.log(JSON.stringify({ verificacion: errores.length ? "ERROR" : "OK", errores, referencias503,
      escriturasRealizadas: plan.ops.size, contadorModificadoPorScript: "NO", deploy: "NO", commitGit: "NO" }, null, 2));
    if (errores.length) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ error: error.message, commitConfirmado: confirmado, aviso: confirmado ? "No se intenta rollback ni otro commit" : "Si hubo error de transporte durante commit, verificar antes de reintentar" }));
    process.exitCode = 1;
  } finally {
    await deleteApp(app);
  }
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { transformar, preparar };
