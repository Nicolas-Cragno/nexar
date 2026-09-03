const test = require("node:test");
const assert = require("node:assert/strict");
const { conciliarGrupo } = require("./conciliacionAdelantosUtils");

const fila = (numero, fecha) => ({ fila: numero, fecha });
const movimiento = (id, fecha) => ({ id, fechaNormalizada: fecha });

test("minimiza globalmente la distancia sin reutilizar movimientos", () => {
  const resultado = conciliarGrupo(
    [fila(1, "2026-06-03"), fila(2, "2026-06-10")],
    [movimiento("a", "2026-06-02"), movimiento("b", "2026-06-09")],
  );
  assert.deepEqual(resultado.resultados.map((item) => [item.fila.fila, item.movimiento.id, item.deltaDias]), [[1, "a", -1], [2, "b", -1]]);
});

test("marca múltiples asignaciones óptimas como ambiguas", () => {
  const resultado = conciliarGrupo(
    [fila(1, "2026-06-03")],
    [movimiento("a", "2026-06-02"), movimiento("b", "2026-06-04")],
  );
  assert.equal(resultado.resultados[0].estado, "AMBIGUO");
  assert.deepEqual(resultado.resultados[0].candidatos.map((item) => item.id), ["a", "b"]);
});

test("distingue filas sin movimiento cuando faltan candidatos", () => {
  const resultado = conciliarGrupo([fila(1, "2026-06-03"), fila(2, "2026-06-04")], [movimiento("a", "2026-06-03")]);
  assert.equal(resultado.asignadosOptimos, 1);
  assert.equal(resultado.resultados.filter((item) => item.estado === "SIN_MOVIMIENTO").length, 1);
});

test("marca como ambiguos los intercambios entre movimientos con la misma fecha", () => {
  const resultado = conciliarGrupo(
    [fila(1, "2026-06-02"), fila(2, "2026-06-03")],
    [movimiento("a", "2026-06-01"), movimiento("b", "2026-06-01")],
  );
  assert.deepEqual(resultado.resultados.map((item) => item.estado), ["AMBIGUO", "AMBIGUO"]);
});
