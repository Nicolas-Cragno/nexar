const fs = require("node:fs");
const path = require("node:path");
const { applicationDefault, getApps, initializeApp } = require("firebase-admin/app");
const { Timestamp, getFirestore } = require("firebase-admin/firestore");
const {
  agruparTramos,
  conservarPrimerRegistro,
  convertirFecha,
  formatearFecha,
  normalizarDocumento,
  obtenerMaximoCorrelativo,
} = require("./migracionUtils");
const {
  construirMovimientosFinales,
  reconstruirCuentaCorriente,
} = require("./reconstruirCuentaCorriente");

const PROJECT_ID = "nexar-transcan";
const DATOS_DIR = path.resolve(__dirname, "../../src/firebase/cargasMasivas/datos");
const ARCHIVOS = {
  viajes: "cargaViajes.json",
  tramos: "cargaTramos.json",
  estados: "cargaEstadoViaje.json",
  cruces: "cargaCruces.json",
  movimientos: "cargaMovimientos.json",
  liquidaciones: "cargaLiquidaciones.json",
};
const CONTADORES = ["viajes", "movimientos", "cruces", "liquidaciones"];

const leerArchivo = (nombre) => {
  const ruta = path.join(DATOS_DIR, nombre);
  try {
    const contenido = fs.readFileSync(ruta, "utf8");
    const registros = JSON.parse(contenido);
    if (!Array.isArray(registros)) throw new Error("La raíz debe ser un array.");
    return { registros, error: null };
  } catch (error) {
    return { registros: [], error: error.message };
  }
};

const crearResultado = (archivo, total) => ({
  archivo,
  total,
  validos: 0,
  invalidos: [],
  duplicados: [],
  cuentasNoResueltas: [],
  viajesInexistentes: [],
  crear: 0,
  actualizar: 0,
  fatal: null,
});

const convertirTimestamps = (valor) => {
  if (valor instanceof Date) return Timestamp.fromDate(valor);
  if (Array.isArray(valor)) return valor.map(convertirTimestamps);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor).map(([key, item]) => [key, convertirTimestamps(item)]));
  }
  return valor;
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

const leerEstadoRemoto = async (db) => {
  const nombres = [
    "cuentaCorriente",
    "viajes",
    "movimientos",
    "liquidaciones",
    "cruces",
  ];
  const colecciones = await Promise.all(nombres.map((nombre) => leerColeccion(db, nombre)));
  const contadores = await Promise.all(
    CONTADORES.map(async (nombre) => {
      const snapshot = await db.collection("contadores").doc(nombre).get();
      return [nombre, snapshot.exists ? snapshot.data() : null];
    }),
  );

  return {
    ...Object.fromEntries(nombres.map((nombre, index) => [nombre, colecciones[index]])),
    contadores: Object.fromEntries(contadores),
  };
};

const resolverCuentas = (cuentas) => {
  const porDni = new Map();
  for (const [id, cuenta] of cuentas) {
    const dni = String(cuenta.dni ?? "");
    if (!dni) continue;
    if (!porDni.has(dni)) porDni.set(dni, []);
    porDni.get(dni).push({ id, ...cuenta });
  }
  return porDni;
};

const validarId = (registro, campo) => {
  const valor = registro[campo];
  return valor === null || valor === undefined || String(valor).trim() === ""
    ? `Falta ${campo}.`
    : null;
};

const normalizarRegistros = (registros, resultado) => registros.flatMap((registro, index) => {
  try {
    return [{ registro: normalizarDocumento(registro), fila: index + 1 }];
  } catch (error) {
    resultado.invalidos.push({ fila: index + 1, motivo: error.message });
    return [];
  }
});

const prepararColeccion = ({ nombre, archivo, remoto, campoId = "id", transformar, reemplazoCompleto = false }) => {
  const lectura = leerArchivo(archivo);
  const resultado = crearResultado(archivo, lectura.registros.length);
  if (lectura.error) {
    resultado.fatal = lectura.error;
    return { nombre, resultado, operaciones: [], registros: [] };
  }

  const normalizados = normalizarRegistros(lectura.registros, resultado);
  const deduplicados = conservarPrimerRegistro(normalizados, (item) => item.registro[campoId]);
  resultado.duplicados = deduplicados.duplicados.map((duplicado) => ({
    ...duplicado,
    conservado: normalizados[duplicado.conservado - 1]?.fila,
    ignorado: normalizados[duplicado.ignorado - 1]?.fila,
  }));

  const operaciones = [];
  const registros = [];
  for (const item of deduplicados.conservados) {
    const errorId = validarId(item.registro, campoId);
    if (errorId) {
      resultado.invalidos.push({ fila: item.fila, motivo: errorId });
      continue;
    }
    try {
      const documento = transformar ? transformar(item.registro, item.fila, resultado) : item.registro;
      if (!documento) continue;
      const id = String(documento[campoId]);
      operaciones.push({
        tipo: remoto.has(id) ? "actualizar" : "crear",
        coleccion: nombre,
        id,
        datos: documento,
        reemplazoCompleto,
      });
      registros.push(documento);
    } catch (error) {
      resultado.invalidos.push({ fila: item.fila, id: item.registro[campoId], motivo: error.message });
    }
  }

  resultado.validos = operaciones.length;
  resultado.crear = operaciones.filter((operacion) => operacion.tipo === "crear").length;
  resultado.actualizar = operaciones.filter((operacion) => operacion.tipo === "actualizar").length;
  return { nombre, resultado, operaciones, registros };
};

const prepararMigracion = (remoto) => {
  const cuentasPorDni = resolverCuentas(remoto.cuentaCorriente);

  const viajes = prepararColeccion({
    nombre: "viajes",
    archivo: ARCHIVOS.viajes,
    remoto: remoto.viajes,
    reemplazoCompleto: true,
    transformar: (registro) => ({
      id: String(registro.id),
      fecha: registro.fecha,
      operador: registro.operador,
      persona: registro.persona,
      tractor: registro.tractor,
      furgon: Array.isArray(registro.furgon) ? registro.furgon : [],
      detalle: registro.detalle ?? "",
    }),
  });

  const viajesDisponibles = new Set([...remoto.viajes.keys(), ...viajes.registros.map((viaje) => viaje.id)]);

  const prepararConCuenta = (tipo) => ({
    nombre: tipo,
    archivo: ARCHIVOS[tipo],
    remoto: remoto[tipo],
    reemplazoCompleto: true,
    transformar: (registro, fila, resultado) => {
      const dni = String(registro.persona ?? "");
      const coincidencias = cuentasPorDni.get(dni) || [];
      if (coincidencias.length !== 1) {
        resultado.cuentasNoResueltas.push({ fila, id: registro.id, dni, coincidencias: coincidencias.map((cuenta) => cuenta.id) });
        throw new Error(coincidencias.length ? `DNI ${dni} asociado a múltiples cuentas.` : `DNI ${dni} sin cuenta corriente.`);
      }
      const cuenta = coincidencias[0].id;
      const documento = { ...registro };
      if (tipo === "movimientos") documento.persona = cuenta;
      if (tipo === "liquidaciones") documento.cuenta = cuenta;
      return documento;
    },
  });

  const cruces = prepararColeccion({
    nombre: "cruces",
    archivo: ARCHIVOS.cruces,
    remoto: remoto.cruces,
    reemplazoCompleto: true,
    transformar: (registro, fila, resultado) => {
      if (registro.viaje && !viajesDisponibles.has(String(registro.viaje))) {
        resultado.viajesInexistentes.push({ fila, id: registro.id, viaje: registro.viaje });
        throw new Error(`Viaje referenciado inexistente: ${registro.viaje}.`);
      }
      return { ...registro, furgon: Array.isArray(registro.furgon) ? registro.furgon : [] };
    },
  });

  const movimientos = prepararColeccion(prepararConCuenta("movimientos"));
  movimientos.operaciones = movimientos.operaciones.filter((operacion) => {
    const viaje = operacion.datos.viaje;
    if (!viaje || viajesDisponibles.has(String(viaje))) return true;
    movimientos.resultado.viajesInexistentes.push({ id: operacion.id, viaje });
    movimientos.resultado.invalidos.push({ id: operacion.id, motivo: `Viaje referenciado inexistente: ${viaje}.` });
    return false;
  });
  movimientos.resultado.validos = movimientos.operaciones.length;
  movimientos.resultado.crear = movimientos.operaciones.filter((item) => item.tipo === "crear").length;
  movimientos.resultado.actualizar = movimientos.operaciones.filter((item) => item.tipo === "actualizar").length;

  const liquidaciones = prepararColeccion(prepararConCuenta("liquidaciones"));

  const tramosLectura = leerArchivo(ARCHIVOS.tramos);
  const tramosResultado = crearResultado(ARCHIVOS.tramos, tramosLectura.registros.length);
  const tramosOperaciones = [];
  if (tramosLectura.error) {
    tramosResultado.fatal = tramosLectura.error;
  } else {
    const normalizados = normalizarRegistros(tramosLectura.registros, tramosResultado);
    const agrupados = agruparTramos(normalizados.map((item) => item.registro));
    tramosResultado.duplicados = agrupados.duplicados;
    for (const [viaje, registros] of agrupados.grupos) {
      if (!viajesDisponibles.has(viaje)) {
        tramosResultado.viajesInexistentes.push({ viaje });
        tramosResultado.invalidos.push({ viaje, motivo: "Viaje inexistente." });
        continue;
      }
      tramosOperaciones.push({ tipo: "actualizar", coleccion: "viajes", id: viaje, datos: { tramos: registros.map(({ viaje: _, ...tramo }) => tramo) } });
    }
    tramosResultado.validos = tramosOperaciones.length;
    tramosResultado.actualizar = tramosOperaciones.length;
  }
  const tramos = { nombre: "tramos", resultado: tramosResultado, operaciones: tramosOperaciones, registros: [] };

  const estados = prepararColeccion({
    nombre: "viajes",
    archivo: ARCHIVOS.estados,
    remoto: remoto.viajes,
    campoId: "viaje",
    transformar: (registro, fila, resultado) => {
      if (!viajesDisponibles.has(String(registro.viaje))) {
        resultado.viajesInexistentes.push({ fila, viaje: registro.viaje });
        throw new Error(`Viaje inexistente: ${registro.viaje}.`);
      }
      return { viaje: String(registro.viaje), estado: registro.estado };
    },
  });
  estados.operaciones = estados.operaciones.map((operacion) => ({ ...operacion, id: String(operacion.datos.viaje), datos: { estado: operacion.datos.estado } }));

  return [viajes, tramos, estados, cruces, movimientos, liquidaciones];
};

const obtenerComparacionContadores = (planes, remoto) => {
  const porArchivo = Object.fromEntries(planes.map((plan) => [plan.resultado.archivo, plan]));
  return CONTADORES.map((nombre) => {
    const plan = porArchivo[ARCHIVOS[nombre]];
    const importado = plan ? obtenerMaximoCorrelativo(plan.registros) : 0;
    const actual = remoto.contadores[nombre];
    const ultimoActual = Number(actual?.ultimo) || 0;
    return {
      contador: nombre,
      maximoImportado: importado,
      ultimoActual,
      recomendado: Math.max(importado, ultimoActual),
      existe: actual !== null,
    };
  });
};

const imprimirReporteCuentaCorriente = (reconstruccion) => {
  const { resumen, errores, muestra } = reconstruccion;
  console.log("\ncuentaCorriente");
  console.log(JSON.stringify({
    totalCuentasExistentes: resumen.totalCuentas,
    totalMovimientosFinalesConsiderados: resumen.totalMovimientosFinales,
    movimientosPendientes: resumen.pendientes,
    movimientosHistoricosIgnorados: resumen.ignorados,
    pendientesPorTipo: resumen.pendientesPorTipo,
    movimientosPendientesConMontoCero: resumen.movimientosPendientesEnCero,
    pendientesConMontoCeroPorTipo: resumen.pendientesEnCeroPorTipo,
    cuentasPersonalesAfectadas: resumen.cuentasPersonalesAfectadas,
    cuentasQueQuedarianEnCero: resumen.cuentasEnCero,
    cuentasQueQuedarianPositivas: resumen.cuentasPositivas,
    cuentasQueQuedarianNegativas: resumen.cuentasNegativas,
    saldoActualTranscan: resumen.saldoActualTranscan,
    saldoRecalculadoTranscan: resumen.saldoRecalculadoTranscan,
    sumaSaldosPersonalesRecalculados: resumen.sumaSaldosPersonales,
    sumaGlobal: resumen.sumaGlobal,
    diferenciaRespectoCero: resumen.diferenciaRespectoCero,
    cuentasSinCambios: resumen.cuentasSinCambios,
    cuentasQueCambiarian: resumen.cuentasQueCambian,
    cuentasConSaldoQueQuedarianEnCero: resumen.cuentasConSaldoQueQuedanEnCero,
    cuentasEnCeroQuePasarianATenerSaldo: resumen.cuentasEnCeroQuePasanATenerSaldo,
    valido: reconstruccion.valido,
  }, null, 2));
  console.log("Muestra de cuentas:", JSON.stringify(muestra, null, 2));
  const erroresPresentes = Object.fromEntries(Object.entries(errores).filter(([, items]) => items.length));
  if (Object.keys(erroresPresentes).length) console.log("Errores cuentaCorriente:", JSON.stringify(erroresPresentes, null, 2));
};

const imprimirReporte = (planes, comparacion, reconstruccion) => {
  console.log(`Proyecto: ${PROJECT_ID}`);
  console.log("Modo: DRY RUN, sin escrituras");
  console.log("Fechas:");
  for (const ejemplo of [86, "86", -5, "-5"]) {
    console.log(`  ${JSON.stringify(ejemplo)} -> ${formatearFecha(convertirFecha(ejemplo))}`);
  }

  for (const plan of planes) {
    const resultado = plan.resultado;
    console.log(`\n${resultado.archivo}`);
    console.log(JSON.stringify({
      total: resultado.total,
      validos: resultado.validos,
      invalidos: resultado.invalidos.length,
      duplicadosIgnorados: resultado.duplicados.length,
      cuentasNoResueltas: resultado.cuentasNoResueltas.length,
      viajesInexistentes: resultado.viajesInexistentes.length,
      documentosACrear: resultado.crear,
      documentosAActualizar: resultado.actualizar,
      fatal: resultado.fatal,
    }, null, 2));
    if (resultado.duplicados.length) console.log("Duplicados:", JSON.stringify(resultado.duplicados, null, 2));
    if (resultado.invalidos.length) console.log("Inválidos:", JSON.stringify(resultado.invalidos, null, 2));
    if (resultado.cuentasNoResueltas.length) console.log("Cuentas no resueltas:", JSON.stringify(resultado.cuentasNoResueltas, null, 2));
    if (resultado.viajesInexistentes.length) console.log("Viajes inexistentes:", JSON.stringify(resultado.viajesInexistentes, null, 2));
  }

  console.log("\nContadores:");
  console.log(JSON.stringify(comparacion, null, 2));
  imprimirReporteCuentaCorriente(reconstruccion);
};

const ejecutarCommit = async (db, planes, reconstruccion) => {
  const errores = planes.reduce((total, plan) => total + plan.resultado.invalidos.length + (plan.resultado.fatal ? 1 : 0), 0);
  if (errores) throw new Error(`Commit bloqueado: existen ${errores} errores de validación.`);
  if (!reconstruccion.valido) {
    throw new Error(`Commit bloqueado: existen ${reconstruccion.erroresLista.length} errores en la reconstrucción de cuentaCorriente.`);
  }
  const operaciones = planes.flatMap((plan) => plan.operaciones);
  console.log(`Proyecto: ${PROJECT_ID}`);
  console.log(`${operaciones.filter((item) => item.tipo === "crear").length} documentos serán creados`);
  console.log(`${operaciones.filter((item) => item.tipo === "actualizar").length} documentos serán actualizados`);

  for (let inicio = 0; inicio < operaciones.length; inicio += 400) {
    const batch = db.batch();
    for (const operacion of operaciones.slice(inicio, inicio + 400)) {
      const referencia = db.collection(operacion.coleccion).doc(operacion.id);
      const datos = convertirTimestamps(operacion.datos);
      if (operacion.reemplazoCompleto) batch.set(referencia, datos);
      else batch.set(referencia, datos, { merge: true });
    }
    await batch.commit();
  }

  for (let inicio = 0; inicio < reconstruccion.operaciones.length; inicio += 400) {
    const batch = db.batch();
    for (const operacion of reconstruccion.operaciones.slice(inicio, inicio + 400)) {
      batch.set(db.collection("cuentaCorriente").doc(operacion.id), operacion.datos, { merge: true });
    }
    await batch.commit();
  }
};

const main = async () => {
  const flags = process.argv.slice(2);
  if (flags.length !== 1 || !["--dry-run", "--commit"].includes(flags[0])) {
    throw new Error("Uso: node scripts/migracion/cargarDatos.js --dry-run | --commit");
  }

  const db = inicializarAdmin();
  const remoto = await leerEstadoRemoto(db);
  const planes = prepararMigracion(remoto);
  const comparacion = obtenerComparacionContadores(planes, remoto);
  const movimientosImportados = planes.find((plan) => plan.resultado.archivo === ARCHIVOS.movimientos)?.registros || [];
  const movimientosFinales = construirMovimientosFinales(remoto.movimientos, movimientosImportados);
  const reconstruccion = reconstruirCuentaCorriente({ cuentas: remoto.cuentaCorriente, movimientos: movimientosFinales });
  imprimirReporte(planes, comparacion, reconstruccion);
  if (flags[0] === "--commit") await ejecutarCommit(db, planes, reconstruccion);
};

main().catch((error) => {
  console.error(`[MIGRACIÓN ABORTADA] ${error.message}`);
  process.exitCode = 1;
});
