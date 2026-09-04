const net = require("node:net");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, Timestamp, getFirestore } = require("firebase-admin/firestore");
const { AUTH_HOST, FIRESTORE_HOST, PROJECT_ID, validarDestinoEmulator } = require("./seedConfig");

const EMAIL = "dev@nexar.local";
const PASSWORD = "NexarDev123!";

const comprobarPuerto = (port) => new Promise((resolve, reject) => {
  const socket = net.createConnection({ host: "127.0.0.1", port });
  const cerrar = () => socket.destroy();
  socket.setTimeout(2000);
  socket.once("connect", () => { cerrar(); resolve(); });
  socket.once("timeout", () => { cerrar(); reject(new Error(`El puerto local ${port} no responde.`)); });
  socket.once("error", () => reject(new Error(`El puerto local ${port} no responde.`)));
});

const limpiarEmuladores = async () => {
  const respuestas = await Promise.all([
    fetch(`http://${FIRESTORE_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, { method: "DELETE" }),
    fetch(`http://${AUTH_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: "DELETE" }),
  ]);
  if (respuestas.some((respuesta) => !respuesta.ok)) throw new Error("No se pudo reiniciar el estado local de los emuladores.");
};

const main = async () => {
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.GCLOUD_PROJECT = PROJECT_ID;
  process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_HOST;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_HOST;
  validarDestinoEmulator({
    projectId: process.env.GCLOUD_PROJECT,
    firestoreHost: process.env.FIRESTORE_EMULATOR_HOST,
    authHost: process.env.FIREBASE_AUTH_EMULATOR_HOST,
  });
  await Promise.all([comprobarPuerto(8080), comprobarPuerto(9099)]);
  await limpiarEmuladores();

  const app = initializeApp({ projectId: PROJECT_ID });
  const auth = getAuth(app);
  const db = getFirestore(app);
  const usuarioAuth = await auth.createUser({ email: EMAIL, password: PASSWORD, displayName: "Administrador local Nexar" });
  const uid = usuarioAuth.uid;
  const ahora = Timestamp.fromDate(new Date("2026-09-04T12:00:00.000Z"));
  const batch = db.batch();
  const guardar = (coleccion, id, datos) => batch.set(db.collection(coleccion).doc(id), { id, ...datos });

  guardar("roles", "DEV_ADMIN", { nombre: "Administrador local", estado: true });
  guardar("permisosRoles", "DEV_ADMIN", { estado: true, allAccess: true });
  guardar("usuarios", "DEV-001", { uid, mail: EMAIL, tipo: "DEV_ADMIN", nombres: "Usuario", apellido: "Local", sucursal: "01", estado: true });
  guardar("accesosUsuarios", uid, { uid, usuarioId: "DEV-001", tipo: "DEV_ADMIN", estado: true });
  guardar("ubicaciones", "01", { nombre: "Sucursal local", estado: true });
  guardar("sectores", "DEV-DEPOSITO", { nombre: "Depósito local", estado: true });
  guardar("empresas", "30700000001", { cuit: "30700000001", nombre: "Empresa ficticia local", razonSocial: "Empresa Ficticia Local SA", tipo: "propia", estado: true });

  guardar("personas", "30000001", { dni: "30000001", cuit: "20300000019", nombres: "Chofer", apellido: "Disponible", puesto: "CHOFER", sucursal: "01", estado: true, enViaje: false, viajeActivo: null });
  guardar("personas", "30000002", { dni: "30000002", cuit: "20300000027", nombres: "Chofer", apellido: "En Viaje", puesto: "CHOFER", sucursal: "01", estado: true, enViaje: true, viajeActivo: "001-00000001" });
  guardar("personas", "30000003", { dni: "30000003", cuit: "20300000035", nombres: "Operador", apellido: "Local", puesto: "ADMINISTRATIVO", sucursal: "01", estado: true, enViaje: false, viajeActivo: null });
  guardar("tractores", "TR-DEV-01", { dominio: "DEV001", empresa: "30700000001", estado: true, enViaje: true, viajeActivo: "001-00000001" });
  guardar("tractores", "TR-DEV-02", { dominio: "DEV002", empresa: "30700000001", estado: true, enViaje: false, viajeActivo: null });
  guardar("tractores", "TR-DEV-03", { dominio: "DEV003", empresa: "30700000001", estado: true, enViaje: false, viajeActivo: null });
  guardar("furgones", "FG-DEV-01", { dominio: "FDEV01", tipo: "SEMI", empresa: "30700000001", estado: true, enViaje: true, viajeActivo: "001-00000001" });
  guardar("furgones", "FG-DEV-02", { dominio: "FDEV02", tipo: "SEMI", empresa: "30700000001", estado: true, enViaje: true, viajeActivo: "001-00000001" });
  guardar("furgones", "FG-DEV-03", { dominio: "FDEV03", tipo: "SEMI", empresa: "30700000001", estado: true, enViaje: false, viajeActivo: null });

  guardar("cuentaCorriente", "20300000019", { dni: "30000001", nombre: "Chofer Disponible", monto: 0, estado: true });
  guardar("cuentaCorriente", "20300000027", { dni: "30000002", nombre: "Chofer En Viaje", monto: 50000, estado: true });
  guardar("cuentaCorriente", "33719349949", { nombre: "Transcan local", monto: -50000, estado: true });
  guardar("viajes", "001-00000001", { fecha: ahora, estado: true, anulado: false, situacion: "EN_CURSO", persona: "30000002", tractor: "TR-DEV-01", furgon: ["FG-DEV-01", "FG-DEV-02"], cliente: ["30700000001"], operador: "30000003", detalle: "Viaje ficticio local", movimiento: true, adelanto: 50000 });
  guardar("viajes", "001-00000002", { fecha: ahora, estado: false, anulado: false, persona: "30000001", tractor: null, furgon: [], cliente: [], operador: "30000003", detalle: "Viaje finalizado ficticio" });
  guardar("movimientos", "001-00000001", { fecha: ahora, persona: "20300000027", cuenta: "20300000027", viaje: "001-00000001", tipo: "PAGO", monto: 50000, nroAdelanto: "0001-00000001", operador: "30000003", detalle: "PAGO ficticio local", estado: false, anulado: false });
  guardar("movimientos", "001-00000002", { fecha: ahora, persona: "20300000027", cuenta: "20300000027", viaje: "001-00000001", tipo: "GASTO", monto: 10000, operador: "30000003", detalle: "Gasto ficticio local", estado: true, liquidacion: "001-00000001", anulado: false });
  guardar("cruces", "001-00000001", { fecha: ahora, estado: true, anulado: false, viaje: "001-00000001", persona: "30000002", tractor: "TR-DEV-01", furgon: ["FG-DEV-01", "FG-DEV-02"], operador: "30000003", detalle: "Cruce ficticio local" });
  guardar("liquidaciones", "001-00000001", { fecha: ahora, cuenta: "20300000027", persona: "20300000027", movimientos: ["001-00000002"], saldoLiquidado: -10000, tipoCierre: "COBRO", movimientoCierre: null, operador: "30000003", detalle: "Liquidación ficticia local", estado: true, anulado: false });

  ["viajes", "movimientos", "cruces", "liquidaciones"].forEach((nombre) => {
    guardar("contadores", nombre, { ultimo: nombre === "movimientos" ? 2 : nombre === "viajes" ? 2 : 1, "01": nombre === "movimientos" ? 2 : nombre === "viajes" ? 2 : 1 });
  });
  guardar("contadores", "adelantos", { ultimo: 1, "01": 1 });
  await batch.commit();

  console.log("Seed local completado en Firebase Emulator Suite.");
  console.log(`Usuario local: ${EMAIL}`);
  console.log(`Password local: ${PASSWORD}`);
};

main().catch((error) => {
  console.error(`[SEED EMULATOR ABORTADO] ${error.message}`);
  process.exitCode = 1;
});
