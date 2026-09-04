import {
  impactoMovimiento,
  movimientoPuedeAnularse,
  movimientosRestaurables,
  permisoAnulacion,
  recursoPerteneceAlViaje,
  validarMotivoAnulacion,
} from "./anulaciones";

describe("anulaciones", () => {
  test.each([
    ["PAGO", 100],
    ["ADELANTO", 100],
    ["COBRO", -100],
    ["GASTO", -100],
  ])("calcula el impacto original de %s para invertirlo una sola vez", (tipo, esperado) => {
    expect(impactoMovimiento(tipo, 100)).toBe(esperado);
  });

  test("bloquea movimientos liquidados, anulados y cierres", () => {
    expect(movimientoPuedeAnularse({ estado: false })).toBe(true);
    expect(movimientoPuedeAnularse({ estado: true })).toBe(false);
    expect(movimientoPuedeAnularse({ estado: false, liquidacion: "L-1" })).toBe(false);
    expect(movimientoPuedeAnularse({ estado: false, anulado: true })).toBe(false);
    expect(movimientoPuedeAnularse({ estado: false, esCierreLiquidacion: true })).toBe(false);
  });

  test("preserva datos que no participan de la elegibilidad", () => {
    const movimiento = { estado: false, nroAdelanto: "0001-00000001", id: "M-1" };
    expect(movimientoPuedeAnularse(movimiento)).toBe(true);
    expect(movimiento.nroAdelanto).toBe("0001-00000001");
    expect(movimiento.id).toBe("M-1");
  });

  test("solo libera recursos pertenecientes al viaje", () => {
    expect(recursoPerteneceAlViaje({ viajeActivo: "V-1" }, "V-1")).toBe(true);
    expect(recursoPerteneceAlViaje({ viajeActivo: "V-2" }, "V-1")).toBe(false);
    expect(recursoPerteneceAlViaje({}, "V-1")).toBe(false);
  });

  test("una liquidacion se restaura solo como conjunto consistente", () => {
    expect(movimientosRestaurables([
      { estado: true, liquidacion: "L-1" },
      { estado: true, liquidacion: "L-1" },
    ], "L-1")).toBe(true);
    expect(movimientosRestaurables([
      { estado: true, liquidacion: "L-1" },
      { estado: false, liquidacion: "L-1" },
    ], "L-1")).toBe(false);
  });

  test("el motivo es obligatorio", () => {
    expect(() => validarMotivoAnulacion("   ")).toThrow("obligatorio");
    expect(validarMotivoAnulacion("  ERROR DE CARGA  ")).toBe("ERROR DE CARGA");
  });

  test.each([
    ["movimientos", "movimientosWrite"],
    ["viajes", "viajesWrite"],
    ["cruces", "crucesWrite"],
    ["liquidaciones", "liquidacionesWrite"],
  ])("usa para %s el mismo permiso de creacion", (tipo, permiso) => {
    expect(permisoAnulacion(tipo)).toBe(permiso);
  });
});
