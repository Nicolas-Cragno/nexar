const fs = require("node:fs");
const path = require("node:path");
const { initializeApp, applicationDefault, deleteApp } = require("firebase-admin/app");
const { getFirestore, DocumentReference } = require("firebase-admin/firestore");

const PROJECT_ID = "nexar-transcan";
const MAPEO = Object.freeze({
  "001-00000498": "001-00000496",
  "001-00000499": "001-00000497",
  "001-00000500": "001-00000498",
  "001-00000501": "001-00000499",
  "001-00000502": "001-00000500",
});
const originales = new Set(Object.keys(MAPEO).map((id) => `viajes/${id}`));

// Una sola sustitución por valor: los destinos nunca vuelven a mapearse.
// Conserva Timestamp, GeoPoint, Buffer y otros tipos nativos de Firestore.
function reemplazar(valor, campo, cambios, db) {
  if (typeof valor === "string" && Object.hasOwn(MAPEO, valor)) {
    cambios.push({ campo, viejo: valor, nuevo: MAPEO[valor] });
    return MAPEO[valor];
  }
  if (valor instanceof DocumentReference && originales.has(valor.path)) {
    const nuevo = `viajes/${MAPEO[valor.id]}`;
    cambios.push({ campo, viejo: valor.path, nuevo, tipo: "DocumentReference" });
    return db.doc(nuevo);
  }
  if (Array.isArray(valor)) return valor.map((item, i) => reemplazar(item, [...campo, i], cambios, db));
  if (valor && Object.getPrototypeOf(valor) === Object.prototype) {
    return Object.fromEntries(Object.entries(valor).map(([clave, item]) =>
      [clave, reemplazar(item, [...campo, clave], cambios, db)]));
  }
  return valor;
}

// La exploración de rutas no debe consumir el plazo de la transacción.
// No lee ni transforma datos de negocio y no realiza escrituras.
async function descubrirColecciones(db) {
  const colecciones = [];
  async function recorrer(col) {
    colecciones.push(col);
    const refs = await col.listDocuments();
    console.error(`Explorando ${col.path}: ${refs.length} rutas`);
    for (let i = 0; i < refs.length; i += 20) {
      const grupos = await Promise.all(refs.slice(i, i + 20).map((ref) => ref.listCollections()));
      for (const sub of grupos.flat()) await recorrer(sub);
    }
  }
  for (const col of await db.listCollections()) await recorrer(col);
  return colecciones;
}

async function preparar(db, tx, rutasColecciones) {
  // Guardar TODOS los originales completos antes de preparar cualquier escritura.
  const fuentes = await tx.getAll(...[...originales].map((ruta) => db.doc(ruta)));
  for (const doc of fuentes) {
    if (!doc.exists) throw new Error(`Falta el viaje origen ${doc.id}; se aborta.`);
    if ((await doc.ref.listCollections()).length) {
      throw new Error(`El origen ${doc.ref.path} tiene subcolecciones; requiere un plan específico.`);
    }
  }
  const documentos = new Map();
  const colecciones = [];
  for (const col of rutasColecciones) {
    // La consulta transaccional fija los datos de esta colección en la misma lectura.
    const snap = await tx.get(col);
    colecciones.push({ coleccion: col.path, documentos: snap.size });
    for (const doc of snap.docs) documentos.set(doc.ref.path, doc);
    console.error(`Leída ${col.path}: ${snap.size} documentos`);
  }

  const operaciones = new Map();
  const referencias = [];
  const copias = [];
  for (const fuente of fuentes) {
    const destino = `viajes/${MAPEO[fuente.id]}`;
    if (!originales.has(destino) && documentos.has(destino)) {
      throw new Error(`Destino ocupado por otro viaje: ${destino}; se aborta.`);
    }
    const datos = { ...fuente.data() };
    const cambioId = Object.hasOwn(datos, "id")
      ? { campo: ["id"], viejo: datos.id, nuevo: MAPEO[fuente.id] } : null;
    if (cambioId) datos.id = MAPEO[fuente.id];
    const cambios = [];
    // id ya se ajustó; no remapearlo si coincide con otro origen.
    const nuevos = Object.fromEntries(Object.entries(datos).map(([clave, valor]) =>
      [clave, clave === "id" ? valor : reemplazar(valor, [clave], cambios, db)]));
    referencias.push(...cambios.map((c) => ({ documento: destino, origen: fuente.ref.path, ...c })));
    operaciones.set(destino, { tipo: "set", datos: nuevos });
    copias.push({ origen: fuente.ref.path, destino, accion: documentos.has(destino) ? "sobrescribir" : "crear", cambioId });
  }
  for (const [ruta, doc] of documentos) {
    if (originales.has(ruta)) continue;
    const cambios = [];
    const datos = reemplazar(doc.data(), [], cambios, db);
    if (!cambios.length) continue;
    if (ruta.split("/").includes("contadores")) {
      throw new Error(`Referencia encontrada en ${ruta}; no se permite modificar contadores.`);
    }
    if (operaciones.has(ruta)) throw new Error(`Colisión de operaciones: ${ruta}`);
    referencias.push(...cambios.map((c) => ({ documento: ruta, ...c })));
    operaciones.set(ruta, { tipo: "set", datos });
  }
  const eliminaciones = [...originales].filter((ruta) => !operaciones.has(ruta));
  for (const ruta of eliminaciones) operaciones.set(ruta, { tipo: "delete" });
  if (operaciones.size > 500) throw new Error("El plan supera 500 escrituras; se aborta para mantener una operación atómica.");
  const porColeccion = Object.fromEntries(colecciones.map(({ coleccion }) =>
    [coleccion, { referencias: 0, viaje: 0, viajeActivo: 0, otras: 0, documentos: new Set() }]));
  for (const ref of referencias) {
    const col = ref.documento.split("/").slice(0, -1).join("/");
    const grupo = porColeccion[col];
    grupo.referencias++;
    grupo.documentos.add(ref.documento);
    const campo = ref.campo.filter((parte) => typeof parte === "string").at(-1);
    grupo[campo === "viaje" || campo === "viajeActivo" ? campo : "otras"]++;
  }
  return { operaciones, reporte: {
    proyecto: db.projectId,
    origenesEncontrados: fuentes.map((doc) => doc.id),
    mapeo: MAPEO, copias, eliminaciones, referencias,
    referenciasPorColeccion: Object.fromEntries(Object.entries(porColeccion).map(([col, datos]) =>
      [col, { ...datos, documentos: datos.documentos.size }])),
    coleccionesLeidas: colecciones,
    totalDocumentosModificar: operaciones.size,
    contadorModificado: "NO", deploy: "NO", commitGit: "NO",
  } };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !["--dry-run", "--commit"].includes(args[0])) {
    throw new Error("Uso: node scripts/migracion/renumerarCincoViajes.js --dry-run | --commit");
  }
  const commit = args[0] === "--commit";
  if (process.env.FIRESTORE_EMULATOR_HOST) throw new Error("Emulador configurado: se requiere Firestore REAL.");
  const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../.firebaserc"), "utf8"));
  if (config.projects?.default !== PROJECT_ID) throw new Error("El proyecto de .firebaserc no es nexar-transcan.");
  for (const variable of ["GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT"]) {
    if (process.env[variable] && process.env[variable] !== PROJECT_ID) throw new Error(`${variable} no coincide con nexar-transcan.`);
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const cred = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8"));
    if (cred.project_id !== PROJECT_ID) throw new Error("El proyecto de las credenciales no coincide con nexar-transcan.");
  }
  const app = initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  try {
    const db = getFirestore(app);
    if (app.options.projectId !== PROJECT_ID || db.projectId !== PROJECT_ID) throw new Error("Proyecto efectivo incorrecto.");
    console.error(`Proyecto validado: ${db.projectId}; modo: ${args[0]}`);
    // Resolver la autenticación antes de iniciar la transacción para fallar limpiamente.
    await app.options.credential.getAccessToken();
    const rutasColecciones = await descubrirColecciones(db);
    const reporte = await db.runTransaction(async (tx) => {
      const plan = await preparar(db, tx, rutasColecciones);
      // Dry-run usa una transacción de SOLO LECTURA y nunca encola escrituras.
      if (commit) {
        for (const [ruta, op] of plan.operaciones) {
          if (ruta.split("/").includes("contadores")) throw new Error("Escritura en contador prohibida.");
          if (op.tipo === "delete") tx.delete(db.doc(ruta));
          else tx.set(db.doc(ruta), op.datos);
        }
      }
      return plan.reporte;
    }, commit ? { maxAttempts: 1 } : { readOnly: true });
    console.log(JSON.stringify({ modo: args[0], ...reporte, escriturasRealizadas: commit ? reporte.totalDocumentosModificar : 0 }, null, 2));
  } finally {
    await deleteApp(app);
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`ABORTADO: ${error.message}`);
  process.exitCode = 1;
});
module.exports = { MAPEO, reemplazar, preparar };
