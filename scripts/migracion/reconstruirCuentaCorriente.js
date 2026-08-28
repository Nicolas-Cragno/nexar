const fs = require("node:fs");
const path = require("node:path");
const { applicationDefault, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = "nexar-transcan";
const TRANSCAN_ID = "33719349949";
const TIPOS_VALIDOS = new Set(["PAGO", "COBRO", "GASTO"]);

const obtenerModo = (argumentos) => {
  if (argumentos.length !== 1 || !["--dry-run", "--commit"].includes(argumentos[0])) {
    throw new Error("Uso: node scripts/migracion/reconstruirCuentaCorriente.js --dry-run | --commit");
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

  const app = getApps()[0] || initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
  if (app.options.projectId !== PROJECT_ID) {
    throw new Error(`El projectId efectivo es ${app.options.projectId}; se esperaba ${PROJECT_ID}.`);
  }
  return getFirestore(app);
};

const leerColeccion = async (db, nombre) => {
  const snapshot = await db.collection(nombre).get();
  return new Map(snapshot.docs.map((documento) => [documento.id, documento.data()]));
};

const construirMovimientosFinales = (movimientosRemotos, movimientosImportados) => {
  const finales = new Map(movimientosRemotos);
  for (const movimiento of movimientosImportados) {
    finales.set(String(movimiento.id), movimiento);
  }
  return finales;
};

const convertirCentavos = (valor, permitirNegativo = false) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || (!permitirNegativo && numero < 0)) return null;
  const centavos = numero * 100;
  const redondeado = Math.round(centavos);
  if (Math.abs(centavos - redondeado) > 1e-8) return null;
  return redondeado;
};

const reconstruirCuentaCorriente = ({ cuentas, movimientos }) => {
  const saldoPorCuenta = new Map([...cuentas.keys()].map((id) => [String(id), 0]));
  const errores = {
    transcanInexistente: [],
    personasVacias: [],
    cuentasInexistentes: [],
    montosInvalidos: [],
    tiposInvalidos: [],
    personasTranscan: [],
    estadosInvalidos: [],
    cierreContable: [],
  };
  const pendientesPorTipo = Object.fromEntries([...TIPOS_VALIDOS].map((tipo) => [tipo, { cantidad: 0, centavos: 0 }]));
  const pendientesEnCeroPorTipo = Object.fromEntries([...TIPOS_VALIDOS].map((tipo) => [tipo, 0]));
  const cuentasPersonalesAfectadas = new Set();
  let pendientes = 0;
  let ignorados = 0;

  if (!saldoPorCuenta.has(TRANSCAN_ID)) errores.transcanInexistente.push({ cuenta: TRANSCAN_ID });

  for (const [id, movimiento] of movimientos) {
    if (movimiento.estado === true) {
      ignorados += 1;
      continue;
    }
    if (movimiento.estado !== false) {
      errores.estadosInvalidos.push({ id, estado: movimiento.estado ?? null });
      continue;
    }

    pendientes += 1;
    const persona = String(movimiento.persona ?? "").trim();
    const tipo = String(movimiento.tipo ?? "");
    const centavos = convertirCentavos(movimiento.monto);
    let valido = true;

    if (TIPOS_VALIDOS.has(tipo)) {
      pendientesPorTipo[tipo].cantidad += 1;
      if (centavos !== null) pendientesPorTipo[tipo].centavos += centavos;
      if (centavos === 0) pendientesEnCeroPorTipo[tipo] += 1;
    }

    if (!persona) {
      errores.personasVacias.push({ id });
      valido = false;
    } else if (persona === TRANSCAN_ID) {
      errores.personasTranscan.push({ id, persona });
      valido = false;
    } else if (!saldoPorCuenta.has(persona)) {
      errores.cuentasInexistentes.push({ id, persona });
      valido = false;
    }
    if (centavos === null) {
      errores.montosInvalidos.push({ id, monto: movimiento.monto ?? null });
      valido = false;
    }
    if (!TIPOS_VALIDOS.has(tipo)) {
      errores.tiposInvalidos.push({ id, tipo });
      valido = false;
    }
    if (!valido) continue;

    const signoPersona = tipo === "PAGO" ? 1 : -1;
    saldoPorCuenta.set(persona, saldoPorCuenta.get(persona) + signoPersona * centavos);
    saldoPorCuenta.set(TRANSCAN_ID, saldoPorCuenta.get(TRANSCAN_ID) - signoPersona * centavos);
    cuentasPersonalesAfectadas.add(persona);
  }

  const sumaGlobalCentavos = [...saldoPorCuenta.values()].reduce((total, saldo) => total + saldo, 0);
  if (sumaGlobalCentavos !== 0) errores.cierreContable.push({ diferenciaCentavos: sumaGlobalCentavos });

  const comparaciones = [];
  for (const [id, cuenta] of cuentas) {
    const cuentaId = String(id);
    const montoActual = Number(cuenta.monto ?? 0);
    const actualCentavos = Number.isFinite(montoActual) ? Math.round(montoActual * 100) : 0;
    const recalculadoCentavos = saldoPorCuenta.get(cuentaId);
    comparaciones.push({
      cuenta: cuentaId,
      saldoActual: actualCentavos / 100,
      saldoRecalculado: recalculadoCentavos / 100,
      diferencia: (recalculadoCentavos - actualCentavos) / 100,
    });
  }

  const personales = [...saldoPorCuenta].filter(([id]) => id !== TRANSCAN_ID);
  const saldoPersonalesCentavos = personales.reduce((total, [, saldo]) => total + saldo, 0);
  const saldoTranscanCentavos = saldoPorCuenta.get(TRANSCAN_ID) ?? 0;
  const erroresLista = Object.entries(errores).flatMap(([tipo, items]) => items.map((detalle) => ({ tipo, ...detalle })));
  const cuentasQueCambian = comparaciones.filter((item) => item.diferencia !== 0);

  return {
    valido: erroresLista.length === 0,
    errores,
    erroresLista,
    saldoPorCuenta,
    operaciones: [...saldoPorCuenta].map(([id, centavos]) => ({ id, datos: { monto: centavos / 100 } })),
    resumen: {
      totalCuentas: cuentas.size,
      totalMovimientosFinales: movimientos.size,
      pendientes,
      ignorados,
      pendientesPorTipo: Object.fromEntries(
        Object.entries(pendientesPorTipo).map(([tipo, datos]) => [tipo, { cantidad: datos.cantidad, monto: datos.centavos / 100 }]),
      ),
      movimientosPendientesEnCero: Object.values(pendientesEnCeroPorTipo).reduce((total, cantidad) => total + cantidad, 0),
      pendientesEnCeroPorTipo,
      cuentasPersonalesAfectadas: cuentasPersonalesAfectadas.size,
      cuentasEnCero: [...saldoPorCuenta.values()].filter((saldo) => saldo === 0).length,
      cuentasPositivas: [...saldoPorCuenta.values()].filter((saldo) => saldo > 0).length,
      cuentasNegativas: [...saldoPorCuenta.values()].filter((saldo) => saldo < 0).length,
      saldoActualTranscan: comparaciones.find((item) => item.cuenta === TRANSCAN_ID)?.saldoActual ?? null,
      saldoRecalculadoTranscan: saldoTranscanCentavos / 100,
      sumaSaldosPersonales: saldoPersonalesCentavos / 100,
      sumaGlobal: sumaGlobalCentavos / 100,
      diferenciaRespectoCero: sumaGlobalCentavos / 100,
      cuentasSinCambios: comparaciones.filter((item) => item.diferencia === 0).length,
      cuentasQueCambian: cuentasQueCambian.length,
      cuentasConSaldoQueQuedanEnCero: comparaciones.filter((item) => item.saldoActual !== 0 && item.saldoRecalculado === 0).length,
      cuentasEnCeroQuePasanATenerSaldo: comparaciones.filter((item) => item.saldoActual === 0 && item.saldoRecalculado !== 0).length,
    },
    muestra: [...comparaciones]
      .sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia) || a.cuenta.localeCompare(b.cuenta))
      .slice(0, 10),
  };
};

const imprimirReporte = (reconstruccion) => {
  const { resumen, errores, muestra } = reconstruccion;
  console.log(JSON.stringify({
    totalCuentas: resumen.totalCuentas,
    totalMovimientos: resumen.totalMovimientosFinales,
    movimientosPendientes: resumen.pendientes,
    movimientosHistoricosIgnorados: resumen.ignorados,
    pendientesPorTipo: resumen.pendientesPorTipo,
    movimientosPendientesConMontoCero: resumen.movimientosPendientesEnCero,
    pendientesConMontoCeroPorTipo: resumen.pendientesEnCeroPorTipo,
    cuentasPersonalesAfectadas: resumen.cuentasPersonalesAfectadas,
    cuentasEnCero: resumen.cuentasEnCero,
    cuentasPositivas: resumen.cuentasPositivas,
    cuentasNegativas: resumen.cuentasNegativas,
    saldoActualTranscan: resumen.saldoActualTranscan,
    saldoRecalculadoTranscan: resumen.saldoRecalculadoTranscan,
    sumaSaldosPersonales: resumen.sumaSaldosPersonales,
    sumaGlobal: resumen.sumaGlobal,
    diferenciaRespectoCero: resumen.diferenciaRespectoCero,
    cuentasQueCambiarian: resumen.cuentasQueCambian,
  }, null, 2));
  console.log("Muestra de cuentas:", JSON.stringify(muestra, null, 2));
  const erroresPresentes = Object.fromEntries(Object.entries(errores).filter(([, items]) => items.length));
  console.log("Errores encontrados:", JSON.stringify(erroresPresentes, null, 2));
  console.log(`RECONSTRUCCIÓN CUENTA CORRIENTE VÁLIDA: ${reconstruccion.valido ? "SI" : "NO"}`);
};

const ejecutarEscrituras = async (db, reconstruccion) => {
  if (!reconstruccion.valido) {
    throw new Error(`Commit bloqueado: existen ${reconstruccion.erroresLista.length} errores de validación.`);
  }
  console.log("Validación completa: OK");
  console.log(`Cuentas a actualizar: ${reconstruccion.operaciones.length}`);
  console.log("Iniciando escrituras...");
  for (let inicio = 0; inicio < reconstruccion.operaciones.length; inicio += 400) {
    const batch = db.batch();
    for (const operacion of reconstruccion.operaciones.slice(inicio, inicio + 400)) {
      batch.set(db.collection("cuentaCorriente").doc(operacion.id), operacion.datos, { merge: true });
    }
    await batch.commit();
  }
  console.log("COMMIT COMPLETADO");
};

const main = async (argumentos = process.argv.slice(2)) => {
  const modo = obtenerModo(argumentos);
  const db = inicializarAdmin();
  const [movimientos, cuentas] = await Promise.all([
    leerColeccion(db, "movimientos"),
    leerColeccion(db, "cuentaCorriente"),
  ]);
  const reconstruccion = reconstruirCuentaCorriente({ cuentas, movimientos });

  console.log(`Proyecto: ${PROJECT_ID}`);
  if (modo === "dry-run") {
    console.log("MODO: DRY RUN");
    console.log("NO SE REALIZARÁN ESCRITURAS");
  } else {
    console.log("MODO: COMMIT");
  }
  imprimirReporte(reconstruccion);
  if (modo === "commit") await ejecutarEscrituras(db, reconstruccion);
};

module.exports = {
  PROJECT_ID,
  TRANSCAN_ID,
  construirMovimientosFinales,
  convertirCentavos,
  main,
  obtenerModo,
  reconstruirCuentaCorriente,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`[RECONSTRUCCIÓN ABORTADA] ${error.message}`);
    process.exitCode = 1;
  });
}
