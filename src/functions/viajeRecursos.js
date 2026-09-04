export const normalizarRecursosViaje = (valores = []) =>
  [...new Set((Array.isArray(valores) ? valores : valores ? [valores] : []).filter(Boolean).map(String))];

export const situacionOperativaViaje = (viaje = {}) => {
  if (viaje.situacion) return viaje.situacion;
  if (viaje.estado !== true) return null;
  return viaje.tractor ? "EN_CURSO" : "ESPERANDO_TRACTOR";
};

export const puedeCrearCruceViaje = (viaje = {}) =>
  viaje.estado === true &&
  viaje.anulado !== true &&
  Boolean(viaje.tractor) &&
  situacionOperativaViaje(viaje) !== "ESPERANDO_TRACTOR";

export const prepararCambioTractor = ({ viaje, viajeId, tractorAnterior, tractorNuevo, nuevoId }) => {
  const id = String(viajeId);
  const anteriorId = viaje?.tractor ? String(viaje.tractor) : null;
  const siguienteId = nuevoId ? String(nuevoId) : null;
  if (!viaje) throw new Error(`No existe el viaje ${id}.`);
  if (viaje.anulado === true) throw new Error("No se puede modificar un viaje anulado.");
  if (viaje.estado !== true) throw new Error("No se puede modificar un viaje finalizado.");
  if (siguienteId && siguienteId === anteriorId) throw new Error("Seleccione un tractor diferente.");
  if (anteriorId && String(tractorAnterior?.viajeActivo || "") !== id) {
    throw new Error("El tractor actual ya no pertenece a este viaje.");
  }
  if (siguienteId && (!tractorNuevo || tractorNuevo.enViaje === true || tractorNuevo.viajeActivo)) {
    throw new Error(`El tractor ${siguienteId} ya no está disponible.`);
  }
  return {
    tractor: siguienteId,
    situacion: siguienteId ? "EN_CURSO" : "ESPERANDO_TRACTOR",
  };
};

export const prepararLiberacionFurgon = ({ viaje, viajeId, furgon, furgonId }) => {
  const id = String(viajeId);
  const recursoId = String(furgonId);
  if (!viaje) throw new Error(`No existe el viaje ${id}.`);
  if (viaje.anulado === true) throw new Error("No se puede modificar un viaje anulado.");
  if (viaje.estado !== true) throw new Error("No se puede modificar un viaje finalizado.");
  const actuales = normalizarRecursosViaje(viaje.furgon);
  if (!actuales.includes(recursoId)) throw new Error("El furgón ya no pertenece al viaje.");
  if (String(furgon?.viajeActivo || "") !== id) throw new Error("El furgón está asociado a otro viaje.");
  return {
    furgon: actuales.filter((item) => item !== recursoId),
    situacion: situacionOperativaViaje(viaje),
    persona: viaje.persona,
    tractor: viaje.tractor ?? null,
  };
};

export const recursosActualesParaFinalizar = (viaje = {}) => [
  ...(viaje.persona ? [{ tipo: "personas", id: String(viaje.persona) }] : []),
  ...(viaje.tractor ? [{ tipo: "tractores", id: String(viaje.tractor) }] : []),
  ...normalizarRecursosViaje(viaje.furgon).map((id) => ({ tipo: "furgones", id })),
];
