const test = require("node:test");
const assert = require("node:assert/strict");
const { Timestamp, GeoPoint } = require("firebase-admin/firestore");
const { transformar, preparar } = require("./renumerarDosViajes");

const datos = () => new Map([
  ["viajes/001-00000500", { id: "001-00000500" }],
  ["viajes/001-00000502", { id: "001-00000502", persona: "A", fecha: Timestamp.fromMillis(1000) }],
  ["viajes/001-00000503", { id: "001-00000503", persona: "B", fecha: Timestamp.fromMillis(2000) }],
  ["contadores/viajes", { "01": 502, ultimo: 502 }],
  ["personas/A", { viajeActivo: "001-00000502", nota: "001-00000503" }],
  ["cruces/C", { viaje: "001-00000503", nroAdelanto: "sin cambios" }],
]);
const plan = (data, rutas = ["viajes", "contadores", "personas", "cruces"]) => preparar(
  new Map([...data].map(([ruta, value]) => [ruta, { data: () => value }])), rutas,
);

test("solapamiento conserva los originales y modifica solamente id/referencias", () => {
  const originales = datos();
  const { ops, reporte } = plan(originales);
  assert.equal(ops.size, 5);
  assert.deepEqual(ops.get("viajes/001-00000501").data, { ...originales.get("viajes/001-00000502"), id: "001-00000501" });
  assert.deepEqual(ops.get("viajes/001-00000502").data, { ...originales.get("viajes/001-00000503"), id: "001-00000502" });
  assert.equal(ops.get("viajes/001-00000503").tipo, "delete");
  assert.deepEqual(ops.get("personas/A").data, { viajeActivo: "001-00000501", nota: "001-00000503" });
  assert.equal(ops.get("cruces/C").data.viaje, "001-00000502");
  assert.equal(ops.has("contadores/viajes"), false);
  assert.equal(ops.has("viajes/001-00000500"), false);
  assert.equal(originales.get("viajes/001-00000502").id, "001-00000502");
  assert.equal(reporte.referenciasPorColeccion.personas.viajeActivo, 1);
});

test("preserva tipos nativos y limita sustituciones a nombres de campo e igualdad exacta", () => {
  const fecha = Timestamp.fromMillis(1234);
  const lugar = new GeoPoint(1, 2);
  const entrada = { fecha, lugar, nota: "001-00000502", viaje: "prefijo 001-00000503", nested: [{ viaje: "001-00000503" }] };
  const salida = transformar(entrada);
  assert.equal(salida.fecha, fecha);
  assert.equal(salida.lugar, lugar);
  assert.equal(salida.nota, entrada.nota);
  assert.equal(salida.viaje, entrada.viaje);
  assert.equal(salida.nested[0].viaje, "001-00000502");
});

test("aborta ante destino ocupado, origen ausente, id inconsistente o subcolecciones", () => {
  let data = datos();
  data.set("viajes/001-00000501", {});
  assert.throws(() => plan(data), /ocupado/);
  data = datos();
  data.delete("viajes/001-00000503");
  assert.throws(() => plan(data), /Falta origen/);
  data = datos();
  data.set("viajes/001-00000502", { id: "otro" });
  assert.throws(() => plan(data), /inconsistente/);
  assert.throws(() => plan(datos(), ["viajes/001-00000502/sub"]), /Subcolecciones/);
});

test("aborta referencias inesperadas a 501, referencias en contador o en originales", () => {
  for (const [ruta, value] of [
    ["personas/X", { viajeActivo: "001-00000501" }],
    ["contadores/otro", { viaje: "001-00000503" }],
    ["viajes/001-00000502", { id: "001-00000502", viaje: "001-00000503" }],
  ]) {
    const data = datos();
    data.set(ruta, value);
    assert.throws(() => plan(data), /Referencia|referencias/);
  }
});
