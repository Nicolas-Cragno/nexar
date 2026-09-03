const test = require("node:test");
const assert = require("node:assert/strict");
const { analizarCarga, normalizarFechaMovimiento, validarFilas } = require("./adelantosUtils");

const timestamp = (iso) => ({ toDate: () => new Date(iso) });
const fila = (cambios = {}) => ({ persona: "123", fecha: "2026-07-23", nroAdelanto: "0001-00000001", monto: 100, ...cambios });
const cuenta = (items = [["cuenta-1", { dni: "123" }]]) => new Map(items);
const movimiento = (cambios = {}) => new Map([["mov-1", { persona: "cuenta-1", fecha: timestamp("2026-07-23T15:00:00.000Z"), monto: 100, tipo: "PAGO", ...cambios }]]);
const analizar = (filas = [fila()], cuentas = cuenta(), movimientos = movimiento(), contadorAdelantos = { "01": 769, ultimo: 769 }) => analizarCarga({ filas, cuentas, movimientos, contadorAdelantos });

test("hace match por DNI resuelto, fecha calendario argentina y monto", () => {
  const resultado = analizar();
  assert.equal(resultado.matches.length, 1);
  assert.equal(resultado.candidatos.length, 1);
  assert.equal(resultado.valido, true);
});

test("normaliza Timestamp usando la fecha de Argentina", () => {
  assert.equal(normalizarFechaMovimiento(timestamp("2026-07-24T01:30:00.000Z")), "2026-07-23");
});

test("informa DNI inexistente o ambiguo y omite la fila", () => {
  assert.equal(analizar([fila()], new Map()).resolucion.noResueltas.length, 1);
  assert.equal(analizar([fila()], cuenta([["a", { dni: 123 }], ["b", { dni: "123" }]])).resolucion.noResueltas.length, 1);
});

test("fecha, monto o ausencia de movimiento producen cero coincidencias", () => {
  const fechaDistinta = analizar([fila({ fecha: "2026-07-22" })]);
  assert.equal(fechaDistinta.sinCoincidencia.length, 1);
  assert.equal(fechaDistinta.valido, true);
  assert.equal(analizar([fila({ monto: 101 })]).sinCoincidencia.length, 1);
  assert.equal(analizar([fila()], cuenta(), new Map()).sinCoincidencia.length, 1);
});

test("más de un PAGO coincidente resulta ambiguo", () => {
  const movimientos = movimiento();
  movimientos.set("mov-2", { ...movimientos.get("mov-1") });
  assert.equal(analizar([fila()], cuenta(), movimientos).coincidenciasMultiples.length, 1);
  assert.equal(analizar([fila()], cuenta(), movimientos).valido, true);
});

test("un movimiento no PAGO nunca es candidato", () => {
  const resultado = analizar([fila()], cuenta(), movimiento({ tipo: "COBRO" }));
  assert.equal(resultado.pagosTotales, 0);
  assert.equal(resultado.sinCoincidencia.length, 1);
});

test("nroAdelanto repetidos son información permitida", () => {
  const filas = [fila(), fila({ persona: "456" })];
  const cuentas = cuenta([["cuenta-1", { dni: "123" }], ["cuenta-2", { dni: "456" }]]);
  const movimientos = movimiento();
  movimientos.set("mov-2", { ...movimientos.get("mov-1"), persona: "cuenta-2" });
  const resultado = analizar(filas, cuentas, movimientos);
  assert.equal(resultado.json.numerosRepetidos.length, 1);
  assert.equal(resultado.json.aparicionesDuplicadas, 1);
  assert.equal(resultado.valido, true);
});

test("detecta fila idéntica duplicada", () => {
  const validacion = validarFilas([fila(), fila()]);
  assert.equal(validacion.filasDuplicadas.length, 1);
});

test("clasifica candidato, ya aplicado y valor incompatible", () => {
  assert.equal(analizar().candidatos.length, 1);
  assert.equal(analizar([fila()], cuenta(), movimiento({ nroAdelanto: "0001-00000001" })).yaAplicados.length, 1);
  const conflicto = analizar([fila()], cuenta(), movimiento({ nroAdelanto: "0001-99999999" }));
  assert.equal(conflicto.conflictosExistentes.length, 1);
  assert.equal(conflicto.valido, false);
});

test("bloquea dos filas incompatibles dirigidas al mismo movimiento", () => {
  const resultado = analizar([fila(), fila({ nroAdelanto: "0001-00000002" })]);
  assert.equal(resultado.filasMismoMovimiento.length, 1);
  assert.equal(resultado.conflictosMismoMovimiento.length, 1);
  assert.equal(resultado.valido, false);
});

test("informa filas compatibles dirigidas al mismo movimiento", () => {
  const resultado = analizar([fila(), fila({ persona: "123" })]);
  assert.equal(resultado.filasMismoMovimiento.length, 1);
  assert.equal(resultado.conflictosMismoMovimiento.length, 0);
});

test("valida todos los campos y el formato", () => {
  const invalidas = [
    fila({ persona: 123 }), fila({ persona: "" }), fila({ fecha: "2026-02-30" }),
    fila({ fecha: "23/07/2026" }), fila({ nroAdelanto: "1-1" }), fila({ nroAdelanto: "" }),
    fila({ monto: "100" }), fila({ monto: -1 }), fila({ monto: Infinity }),
  ];
  assert.equal(validarFilas(invalidas).invalidas.length, invalidas.length);
});

test("un contador debajo del máximo histórico bloquea nuevas altas", () => {
  const resultado = analizar([fila({ nroAdelanto: "0001-00000770" })], cuenta(), movimiento(), { "01": 769, ultimo: 769 });
  assert.equal(resultado.contadoresValidos, false);
  assert.equal(resultado.comparacionContadores[0].recomendado, 770);
});

test("acepta ubicación 02 y calcula su máximo independientemente", () => {
  const filas = [fila(), fila({ persona: "456", nroAdelanto: "0002-00000005" })];
  const cuentas = cuenta([["cuenta-1", { dni: "123" }], ["cuenta-2", { dni: "456" }]]);
  const movimientos = movimiento();
  movimientos.set("mov-2", { ...movimientos.get("mov-1"), persona: "cuenta-2" });
  const resultado = analizar(filas, cuentas, movimientos, { "01": 1, "02": 5 });
  assert.deepEqual(resultado.comparacionContadores.map((item) => [item.ubicacion, item.maximoHistorico]), [["01", 1], ["02", 5]]);
});
