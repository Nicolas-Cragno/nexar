const test = require("node:test");
const assert = require("node:assert/strict");
const {
  TRANSCAN_ID,
  construirMovimientosFinales,
  obtenerModo,
  reconstruirCuentaCorriente,
} = require("./reconstruirCuentaCorriente");

const cuentas = (...ids) => new Map([TRANSCAN_ID, ...ids].map((id) => [id, { monto: 0 }]));
const movimientos = (...items) => new Map(items.map((item, index) => [String(index + 1), item]));
const pendiente = (tipo, monto = 100, persona = "persona") => ({ tipo, monto, persona, estado: false });

const calcular = (items, cuentasEntrada = cuentas("persona")) =>
  reconstruirCuentaCorriente({ cuentas: cuentasEntrada, movimientos: movimientos(...items) });

test("reconoce --dry-run", () => {
  assert.equal(obtenerModo(["--dry-run"]), "dry-run");
});

test("reconoce --commit", () => {
  assert.equal(obtenerModo(["--commit"]), "commit");
});

test("rechaza ejecución sin argumentos", () => {
  assert.throws(() => obtenerModo([]), /Uso:/);
});

test("rechaza ambos modos simultáneos", () => {
  assert.throws(() => obtenerModo(["--dry-run", "--commit"]), /Uso:/);
});

test("rechaza argumentos desconocidos", () => {
  assert.throws(() => obtenerModo(["--otro"]), /Uso:/);
});

test("PAGO acredita a la persona y debita a Transcan", () => {
  const resultado = calcular([pendiente("PAGO")]);
  assert.equal(resultado.saldoPorCuenta.get("persona"), 10000);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), -10000);
  assert.equal(resultado.resumen.sumaGlobal, 0);
});

test("COBRO debita a la persona y acredita a Transcan", () => {
  const resultado = calcular([pendiente("COBRO")]);
  assert.equal(resultado.saldoPorCuenta.get("persona"), -10000);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), 10000);
});

test("GASTO debita a la persona y acredita a Transcan", () => {
  const resultado = calcular([pendiente("GASTO")]);
  assert.equal(resultado.saldoPorCuenta.get("persona"), -10000);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), 10000);
});

test("combina PAGO, COBRO y GASTO", () => {
  const resultado = calcular([pendiente("PAGO", 100), pendiente("COBRO", 30), pendiente("GASTO", 20)]);
  assert.equal(resultado.saldoPorCuenta.get("persona"), 5000);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), -5000);
  assert.equal(resultado.resumen.sumaGlobal, 0);
});

test("estado true no impacta saldos", () => {
  const resultado = calcular([{ ...pendiente("PAGO"), estado: true }]);
  assert.equal(resultado.saldoPorCuenta.get("persona"), 0);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), 0);
  assert.equal(resultado.resumen.ignorados, 1);
});

test("cuenta sin movimientos pendientes queda en cero", () => {
  const resultado = calcular([], cuentas("persona", "sin-movimientos"));
  assert.equal(resultado.saldoPorCuenta.get("sin-movimientos"), 0);
});

test("cuenta personal inexistente bloquea", () => {
  const resultado = calcular([pendiente("PAGO", 100, "inexistente")]);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.errores.cuentasInexistentes.length, 1);
});

test("cuenta Transcan inexistente bloquea", () => {
  const resultado = calcular([pendiente("PAGO")], new Map([["persona", { monto: 0 }]]));
  assert.equal(resultado.valido, false);
  assert.equal(resultado.errores.transcanInexistente.length, 1);
});

test("tipo desconocido bloquea", () => {
  const resultado = calcular([pendiente("OTRO")]);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.errores.tiposInvalidos.length, 1);
});

test("PAGO con monto cero es válido y no impacta", () => {
  const resultado = calcular([pendiente("PAGO", 0)]);
  assert.equal(resultado.valido, true);
  assert.equal(resultado.saldoPorCuenta.get("persona"), 0);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), 0);
  assert.equal(resultado.resumen.pendientesEnCeroPorTipo.PAGO, 1);
});

test("COBRO con monto cero es válido y no impacta", () => {
  const resultado = calcular([pendiente("COBRO", 0)]);
  assert.equal(resultado.valido, true);
  assert.equal(resultado.saldoPorCuenta.get("persona"), 0);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), 0);
  assert.equal(resultado.resumen.pendientesEnCeroPorTipo.COBRO, 1);
});

test("GASTO con monto cero es válido y no impacta", () => {
  const resultado = calcular([pendiente("GASTO", 0)]);
  assert.equal(resultado.valido, true);
  assert.equal(resultado.saldoPorCuenta.get("persona"), 0);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), 0);
  assert.equal(resultado.resumen.pendientesEnCeroPorTipo.GASTO, 1);
});

test("monto negativo bloquea", () => {
  const resultado = calcular([pendiente("PAGO", -1)]);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.errores.montosInvalidos.length, 1);
});

test("monto no numérico bloquea", () => {
  const resultado = calcular([pendiente("PAGO", "no-numérico")]);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.errores.montosInvalidos.length, 1);
});

test("monto con más de dos decimales bloquea", () => {
  const resultado = calcular([pendiente("PAGO", 10.001)]);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.errores.montosInvalidos.length, 1);
});

test("persona vacía bloquea", () => {
  const resultado = calcular([pendiente("PAGO", 100, "")]);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.errores.personasVacias.length, 1);
});

test("Transcan como persona bloquea", () => {
  const resultado = calcular([pendiente("PAGO", 100, TRANSCAN_ID)]);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.errores.personasTranscan.length, 1);
});

test("el cálculo es idempotente", () => {
  const entrada = [pendiente("PAGO", 100), pendiente("COBRO", 30)];
  const primero = calcular(entrada);
  const segundo = calcular(entrada);
  assert.deepEqual([...primero.saldoPorCuenta], [...segundo.saldoPorCuenta]);
  assert.deepEqual(primero.operaciones, segundo.operaciones);
});

test("la suma global de todas las cuentas cierra en cero", () => {
  const resultado = calcular([pendiente("PAGO", 10.25), pendiente("GASTO", 3.75)]);
  assert.equal([...resultado.saldoPorCuenta.values()].reduce((total, saldo) => total + saldo, 0), 0);
  assert.equal(resultado.valido, true);
});

test("el saldo actual con ruido de coma flotante no bloquea ni se usa como base", () => {
  const cuentasEntrada = new Map([
    [TRANSCAN_ID, { monto: -20581275.240000002 }],
    ["persona", { monto: 50 }],
  ]);
  const resultado = calcular([pendiente("PAGO", 100)], cuentasEntrada);
  assert.equal(resultado.valido, true);
  assert.equal(resultado.saldoPorCuenta.get(TRANSCAN_ID), -10000);
  assert.equal(resultado.resumen.saldoActualTranscan, -20581275.24);
});

test("los movimientos importados reemplazan por ID y los remotos adicionales permanecen", () => {
  const remotos = new Map([["1", { id: "1", tipo: "PAGO" }], ["2", { id: "2", tipo: "COBRO" }]]);
  const finales = construirMovimientosFinales(remotos, [{ id: "1", tipo: "GASTO" }, { id: "3", tipo: "PAGO" }]);
  assert.equal(finales.size, 3);
  assert.equal(finales.get("1").tipo, "GASTO");
  assert.equal(finales.get("2").tipo, "COBRO");
  assert.equal(finales.get("3").tipo, "PAGO");
});
