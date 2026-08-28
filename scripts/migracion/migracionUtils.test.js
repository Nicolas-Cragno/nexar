const test = require("node:test");
const assert = require("node:assert/strict");
const {
  agruparTramos,
  conservarPrimerRegistro,
  convertirFecha,
  normalizarDocumento,
  obtenerMaximoCorrelativo,
} = require("./migracionUtils");

test("convierte desplazamientos numéricos reproducibles", () => {
  assert.equal(convertirFecha(86).toISOString(), "2026-06-02T15:00:00.000Z");
  assert.equal(convertirFecha("86").toISOString(), "2026-06-02T15:00:00.000Z");
  assert.equal(convertirFecha(-5).toISOString(), "2026-08-22T15:00:00.000Z");
  assert.equal(convertirFecha("-5").toISOString(), "2026-08-22T15:00:00.000Z");
});

test("normaliza fechas vacías y relaciones null", () => {
  assert.deepEqual(normalizarDocumento({ fecha: "1900-01-00", viaje: "null" }), {
    fecha: null,
    viaje: null,
  });
});

test("conserva la primera aparición e informa duplicados", () => {
  const resultado = conservarPrimerRegistro(
    [{ id: "1", valor: "A" }, { id: "1", valor: "B" }, { id: "2", valor: "C" }],
    (registro) => registro.id,
  );
  assert.deepEqual(resultado.conservados, [{ id: "1", valor: "A" }, { id: "2", valor: "C" }]);
  assert.deepEqual(resultado.duplicados, [{ identidad: "1", conservado: 1, ignorado: 2, identico: false }]);
});

test("agrupa tramos diferentes e ignora filas idénticas", () => {
  const primero = { viaje: "1", lugarSalida: "A", lugarLlegada: "B" };
  const segundo = { viaje: "1", lugarSalida: "B", lugarLlegada: "C" };
  const resultado = agruparTramos([primero, segundo, { ...primero }]);
  assert.deepEqual(resultado.grupos.get("1"), [primero, segundo]);
  assert.equal(resultado.duplicados.length, 1);
});

test("calcula el máximo correlativo", () => {
  assert.equal(obtenerMaximoCorrelativo([{ id: "0001-00000002" }, { id: "0001-00000105" }]), 105);
});
