import { asignarNrosAdelanto, formatearNroAdelanto } from "./adelantos";

test.each([
  ["01", 1, "0001-00000001"],
  ["01", 769, "0001-00000769"],
  ["01", 770, "0001-00000770"],
  ["02", 1, "0002-00000001"],
  ["1", 42, "0001-00000042"],
])("formatea ubicación %s y correlativo %s", (ubicacion, correlativo, esperado) => {
  expect(formatearNroAdelanto(ubicacion, correlativo)).toBe(esperado);
});

test("asigna correlativos sólo a movimientos PAGO", () => {
  const resultado = asignarNrosAdelanto([
    { tipo: "PAGO" },
    { tipo: "COBRO" },
    { tipo: "GASTO" },
    { tipo: "ADELANTO" },
    { tipo: "PAGO" },
  ], "01", 769);

  expect(resultado).toEqual({
    cantidad: 2,
    ultimo: 771,
    elementos: [
      { tipo: "PAGO", nroAdelanto: "0001-00000770" },
      { tipo: "COBRO" },
      { tipo: "GASTO" },
      { tipo: "ADELANTO" },
      { tipo: "PAGO", nroAdelanto: "0001-00000771" },
    ],
  });
});

test("rechaza contadores que no sean enteros no negativos", () => {
  expect(() => asignarNrosAdelanto([{ tipo: "PAGO" }], "01", -1)).toThrow();
  expect(() => asignarNrosAdelanto([{ tipo: "PAGO" }], "01", 1.5)).toThrow();
});

test("reserva números diferentes para pagos simultáneos del mismo lote", () => {
  const pagos = Array.from({ length: 25 }, () => ({ tipo: "PAGO" }));
  const resultado = asignarNrosAdelanto(pagos, "01", 769);
  const numeros = resultado.elementos.map((movimiento) => movimiento.nroAdelanto);

  expect(new Set(numeros).size).toBe(25);
  expect(numeros[0]).toBe("0001-00000770");
  expect(numeros[24]).toBe("0001-00000794");
});

test("un PAGO generado desde un viaje consume exactamente un adelanto", () => {
  const resultado = asignarNrosAdelanto([
    { tipo: "PAGO", viaje: "001-00000001" },
  ], "01", 769);

  expect(resultado.cantidad).toBe(1);
  expect(resultado.ultimo).toBe(770);
  expect(resultado.elementos[0].nroAdelanto).toBe("0001-00000770");
});

test("movimientos y liquidaciones continúan una misma secuencia compartida", () => {
  const movimiento = asignarNrosAdelanto([{ tipo: "PAGO" }], "01", 769);
  const liquidacion = asignarNrosAdelanto([
    { tipo: "PAGO", coleccion: "liquidaciones" },
    { tipo: "PAGO", coleccion: "movimientos" },
  ], "01", movimiento.ultimo);
  const noPago = asignarNrosAdelanto([{ tipo: "COBRO" }], "01", liquidacion.ultimo);

  expect(movimiento.elementos[0].nroAdelanto).toBe("0001-00000770");
  expect(liquidacion.elementos[0].nroAdelanto).toBe("0001-00000771");
  expect(liquidacion.elementos[1].nroAdelanto).toBe("0001-00000772");
  expect(noPago.elementos[0].nroAdelanto).toBeUndefined();
  expect(noPago.ultimo).toBe(772);
});
