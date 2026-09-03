const ZONA_HORARIA = "America/Argentina/Buenos_Aires";
const FORMATO_ADELANTO = /^(\d{4})-(\d{8})$/;
const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

const normalizarTexto = (valor) => String(valor ?? "").trim();

const esFechaValida = (valor) => {
  if (typeof valor !== "string") return false;
  const coincidencia = valor.match(FORMATO_FECHA);
  if (!coincidencia) return false;
  const [, anio, mes, dia] = coincidencia;
  const fecha = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));
  return fecha.getUTCFullYear() === Number(anio)
    && fecha.getUTCMonth() + 1 === Number(mes)
    && fecha.getUTCDate() === Number(dia);
};

const normalizarFechaMovimiento = (valor) => {
  const fecha = typeof valor?.toDate === "function" ? valor.toDate() : valor;
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return null;
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);
  const obtener = (tipo) => partes.find((parte) => parte.type === tipo)?.value;
  return `${obtener("year")}-${obtener("month")}-${obtener("day")}`;
};

const firmaFila = (fila) => JSON.stringify([
  fila.persona,
  fila.fecha,
  fila.nroAdelanto,
  fila.monto,
]);

const claveMatch = (persona, fecha, monto) => JSON.stringify([
  normalizarTexto(persona),
  fecha,
  Number(monto),
]);

const validarFilas = (filas) => {
  const validas = [];
  const invalidas = [];
  const numeros = new Map();
  const firmas = new Map();

  if (!Array.isArray(filas)) {
    return {
      validas,
      invalidas: [{ fila: null, errores: ["El contenido debe ser un array."] }],
      numerosDistintos: 0,
      numerosRepetidos: [],
      aparicionesDuplicadas: 0,
      filasDuplicadas: [],
    };
  }

  filas.forEach((original, indice) => {
    const fila = indice + 1;
    const errores = [];
    if (!original || typeof original !== "object" || Array.isArray(original)) {
      invalidas.push({ fila, errores: ["La fila debe ser un objeto."] });
      return;
    }
    if (typeof original.persona !== "string" || !original.persona.trim()) errores.push("persona debe ser un string no vacío.");
    if (!esFechaValida(original.fecha)) errores.push("fecha debe ser una fecha válida YYYY-MM-DD.");
    if (typeof original.nroAdelanto !== "string" || !original.nroAdelanto.trim()) {
      errores.push("nroAdelanto debe ser un string no vacío.");
    } else if (!FORMATO_ADELANTO.test(original.nroAdelanto)) {
      errores.push("nroAdelanto debe respetar XXXX-YYYYYYYY.");
    }
    if (typeof original.monto !== "number" || !Number.isFinite(original.monto) || original.monto < 0) {
      errores.push("monto debe ser un número finito mayor o igual a cero.");
    }

    if (errores.length) {
      invalidas.push({ fila, errores });
      return;
    }

    const normalizada = {
      fila,
      persona: original.persona.trim(),
      fecha: original.fecha,
      nroAdelanto: original.nroAdelanto,
      monto: original.monto,
    };
    validas.push(normalizada);

    if (!numeros.has(normalizada.nroAdelanto)) numeros.set(normalizada.nroAdelanto, []);
    numeros.get(normalizada.nroAdelanto).push(fila);
    const firma = firmaFila(normalizada);
    if (!firmas.has(firma)) firmas.set(firma, []);
    firmas.get(firma).push(fila);
  });

  const numerosRepetidos = [...numeros.entries()]
    .filter(([, ocurrencias]) => ocurrencias.length > 1)
    .map(([nroAdelanto, filasNumero]) => ({ nroAdelanto, filas: filasNumero }));
  const filasDuplicadas = [...firmas.values()]
    .filter((ocurrencias) => ocurrencias.length > 1)
    .map((ocurrencias) => ({ filas: ocurrencias }));

  return {
    validas,
    invalidas,
    numerosDistintos: numeros.size,
    numerosRepetidos,
    aparicionesDuplicadas: numerosRepetidos.reduce((total, item) => total + item.filas.length - 1, 0),
    filasDuplicadas,
  };
};

const resolverCuentas = (filas, cuentas) => {
  const porDni = new Map();
  for (const [id, cuenta] of cuentas) {
    const dni = normalizarTexto(cuenta?.dni);
    if (!dni) continue;
    if (!porDni.has(dni)) porDni.set(dni, []);
    porDni.get(dni).push(String(id));
  }

  const resueltas = [];
  const noResueltas = [];
  for (const fila of filas) {
    const coincidencias = porDni.get(normalizarTexto(fila.persona)) || [];
    if (coincidencias.length !== 1) {
      noResueltas.push({ fila: fila.fila, dni: fila.persona, cuentas: coincidencias });
    } else {
      resueltas.push({ ...fila, cuentaCorrienteId: coincidencias[0] });
    }
  }
  return { resueltas, noResueltas };
};

const analizarCarga = ({ filas, cuentas, movimientos, contadorAdelantos = null }) => {
  const json = validarFilas(filas);
  const resolucion = resolverCuentas(json.validas, cuentas);
  const pagos = [];
  const indice = new Map();
  for (const [id, movimiento] of movimientos) {
    if (movimiento?.tipo !== "PAGO") continue;
    const fecha = normalizarFechaMovimiento(movimiento.fecha);
    const item = { id: String(id), ...movimiento, fechaNormalizada: fecha };
    pagos.push(item);
    if (!fecha || typeof movimiento.monto !== "number" || !Number.isFinite(movimiento.monto)) continue;
    const clave = claveMatch(movimiento.persona, fecha, movimiento.monto);
    if (!indice.has(clave)) indice.set(clave, []);
    indice.get(clave).push(item);
  }

  const matches = [];
  const sinCoincidencia = [];
  const coincidenciasMultiples = [];
  for (const fila of resolucion.resueltas) {
    const candidatos = indice.get(claveMatch(fila.cuentaCorrienteId, fila.fecha, fila.monto)) || [];
    if (candidatos.length === 0) sinCoincidencia.push(fila);
    else if (candidatos.length > 1) coincidenciasMultiples.push({ ...fila, movimientoIds: candidatos.map((item) => item.id) });
    else matches.push({ ...fila, movimientoId: candidatos[0].id, movimiento: candidatos[0] });
  }

  const porMovimiento = new Map();
  for (const match of matches) {
    if (!porMovimiento.has(match.movimientoId)) porMovimiento.set(match.movimientoId, []);
    porMovimiento.get(match.movimientoId).push(match);
  }
  const filasMismoMovimiento = [...porMovimiento.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([movimientoId, items]) => ({ movimientoId, filas: items.map((item) => item.fila), valores: [...new Set(items.map((item) => item.nroAdelanto))] }));
  const conflictosMismoMovimiento = filasMismoMovimiento
    .filter((item) => item.valores.length > 1);
  const movimientosIncompatibles = new Set(conflictosMismoMovimiento.map((item) => item.movimientoId));
  const conflictosExistentes = matches
    .filter((match) => match.movimiento.nroAdelanto != null
      && match.movimiento.nroAdelanto !== ""
      && match.movimiento.nroAdelanto !== match.nroAdelanto)
    .map((match) => ({ fila: match.fila, movimientoId: match.movimientoId, esperado: match.nroAdelanto, existente: match.movimiento.nroAdelanto }));
  const conflictosExistentesIds = new Set(conflictosExistentes.map((item) => item.movimientoId));
  const candidatos = matches.filter((match) => !movimientosIncompatibles.has(match.movimientoId)
    && !conflictosExistentesIds.has(match.movimientoId)
    && (match.movimiento.nroAdelanto == null || match.movimiento.nroAdelanto === ""));
  const yaAplicados = matches.filter((match) => match.movimiento.nroAdelanto === match.nroAdelanto);

  const maximosHistoricos = new Map();
  for (const fila of json.validas) {
    const coincidencia = fila.nroAdelanto.match(FORMATO_ADELANTO);
    const ubicacion = String(Number(coincidencia[1])).padStart(2, "0");
    const correlativo = Number(coincidencia[2]);
    maximosHistoricos.set(ubicacion, Math.max(maximosHistoricos.get(ubicacion) || 0, correlativo));
  }
  const comparacionContadores = [...maximosHistoricos.entries()].map(([ubicacion, maximoHistorico]) => {
    const valorOriginal = contadorAdelantos?.[ubicacion];
    const contadorActual = Number(valorOriginal);
    const contadorValido = Number.isSafeInteger(contadorActual) && contadorActual >= maximoHistorico;
    return { ubicacion, maximoHistorico, contadorActual: Number.isFinite(contadorActual) ? contadorActual : null, contadorValido, recomendado: Math.max(maximoHistorico, Number.isFinite(contadorActual) ? contadorActual : 0) };
  });

  const bloqueos = json.invalidas.length
    + json.filasDuplicadas.length
    + conflictosMismoMovimiento.length
    + conflictosExistentes.length;
  const match100 = filas.length > 0 && matches.length === filas.length
    && resolucion.noResueltas.length === 0
    && sinCoincidencia.length === 0
    && coincidenciasMultiples.length === 0;

  return {
    json,
    resolucion,
    movimientosTotales: movimientos.size,
    pagosTotales: pagos.length,
    matches,
    sinCoincidencia,
    coincidenciasMultiples,
    filasMismoMovimiento,
    conflictosMismoMovimiento,
    conflictosExistentes,
    candidatos,
    yaAplicados,
    maximosHistoricos,
    comparacionContadores,
    match100,
    contadoresValidos: comparacionContadores.every((item) => item.contadorValido),
    valido: bloqueos === 0,
  };
};

module.exports = {
  analizarCarga,
  esFechaValida,
  normalizarFechaMovimiento,
  resolverCuentas,
  validarFilas,
};
