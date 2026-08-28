const FECHA_BASE = new Date("2026-08-27T12:00:00-03:00");
const CAMPOS_FECHA = new Set(["fecha", "fechaSalida", "fechaLlegada"]);

const esStringNumerico = (valor) =>
  typeof valor === "string" && valor.trim() !== "" && Number.isFinite(Number(valor));

const convertirFecha = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor === "string" && valor.startsWith("1900-01-00")) return null;

  if (typeof valor === "number" || esStringNumerico(valor)) {
    const dias = Math.abs(Number(valor));
    if (!Number.isFinite(dias)) throw new Error(`Desplazamiento inválido: ${valor}`);
    return new Date(FECHA_BASE.getTime() - dias * 24 * 60 * 60 * 1000);
  }

  if (typeof valor === "string") {
    const fecha = new Date(valor);
    if (!Number.isNaN(fecha.getTime())) return fecha;
  }

  throw new Error(`Fecha inválida: ${valor}`);
};

const normalizarValor = (valor, campo = "") => {
  if (CAMPOS_FECHA.has(campo)) return convertirFecha(valor);
  if (typeof valor === "string" && valor.trim().toLowerCase() === "null") return null;
  if (Array.isArray(valor)) return valor.map((item) => normalizarValor(item));
  if (valor && typeof valor === "object") return normalizarDocumento(valor);
  return valor;
};

const normalizarDocumento = (documento) =>
  Object.fromEntries(
    Object.entries(documento).map(([campo, valor]) => [campo, normalizarValor(valor, campo)]),
  );

const serializarComparable = (valor) => {
  if (valor instanceof Date) return valor.toISOString();
  if (Array.isArray(valor)) return valor.map(serializarComparable);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.keys(valor).sort().map((key) => [key, serializarComparable(valor[key])]),
    );
  }
  return valor;
};

const firma = (valor) => JSON.stringify(serializarComparable(valor));

const conservarPrimerRegistro = (registros, obtenerIdentidad) => {
  const conservados = [];
  const duplicados = [];
  const primeros = new Map();

  registros.forEach((registro, index) => {
    const identidad = String(obtenerIdentidad(registro));
    if (!primeros.has(identidad)) {
      primeros.set(identidad, { registro, index });
      conservados.push(registro);
      return;
    }

    const primero = primeros.get(identidad);
    duplicados.push({
      identidad,
      conservado: primero.index + 1,
      ignorado: index + 1,
      identico: firma(primero.registro) === firma(registro),
    });
  });

  return { conservados, duplicados };
};

const agruparTramos = (registros) => {
  const grupos = new Map();
  const duplicados = [];

  registros.forEach((registro, index) => {
    const viaje = String(registro.viaje ?? "");
    if (!grupos.has(viaje)) grupos.set(viaje, { tramos: [], firmas: new Map() });
    const grupo = grupos.get(viaje);
    const identidad = firma(registro);

    if (grupo.firmas.has(identidad)) {
      duplicados.push({
        identidad: viaje,
        conservado: grupo.firmas.get(identidad) + 1,
        ignorado: index + 1,
        identico: true,
      });
      return;
    }

    grupo.firmas.set(identidad, index);
    grupo.tramos.push(registro);
  });

  return {
    grupos: new Map([...grupos].map(([viaje, grupo]) => [viaje, grupo.tramos])),
    duplicados,
  };
};

const obtenerCorrelativo = (id) => {
  const coincidencia = String(id ?? "").match(/-(\d+)$/);
  return coincidencia ? Number(coincidencia[1]) : null;
};

const obtenerMaximoCorrelativo = (registros, campo = "id") =>
  registros.reduce((maximo, registro) => {
    const correlativo = obtenerCorrelativo(registro[campo]);
    return correlativo === null ? maximo : Math.max(maximo, correlativo);
  }, 0);

const formatearFecha = (fecha) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);

module.exports = {
  FECHA_BASE,
  agruparTramos,
  conservarPrimerRegistro,
  convertirFecha,
  firma,
  formatearFecha,
  normalizarDocumento,
  obtenerCorrelativo,
  obtenerMaximoCorrelativo,
};
