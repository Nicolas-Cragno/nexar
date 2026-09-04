import {
  puedeCrearCruceViaje,
  prepararCambioTractor,
  prepararLiberacionFurgon,
  recursosActualesParaFinalizar,
  situacionOperativaViaje,
} from "./viajeRecursos";

test("interpreta viajes históricos activos según su tractor", () => {
  expect(situacionOperativaViaje({ estado: true, tractor: "T1" })).toBe("EN_CURSO");
  expect(situacionOperativaViaje({ estado: true, tractor: null })).toBe("ESPERANDO_TRACTOR");
});

test("libera tractor y deja el viaje esperando", () => {
  expect(prepararCambioTractor({
    viaje: { estado: true, tractor: "T1", persona: "P1" },
    viajeId: "V1",
    tractorAnterior: { enViaje: true, viajeActivo: "V1" },
    tractorNuevo: null,
    nuevoId: null,
  })).toEqual({ tractor: null, situacion: "ESPERANDO_TRACTOR" });
});

test("reemplaza o asigna posteriormente un tractor disponible", () => {
  expect(prepararCambioTractor({
    viaje: { estado: true, tractor: "T1", persona: "P1" },
    viajeId: "V1",
    tractorAnterior: { viajeActivo: "V1" },
    tractorNuevo: { enViaje: false, viajeActivo: null },
    nuevoId: "T2",
  })).toEqual({ tractor: "T2", situacion: "EN_CURSO" });
  expect(prepararCambioTractor({
    viaje: { estado: true, tractor: null, situacion: "ESPERANDO_TRACTOR", persona: "P1" },
    viajeId: "V1",
    tractorNuevo: { enViaje: false, viajeActivo: null },
    nuevoId: "T2",
  }).situacion).toBe("EN_CURSO");
});

test("rechaza tractor ocupado o tractor anterior de otro viaje", () => {
  expect(() => prepararCambioTractor({
    viaje: { estado: true, tractor: null }, viajeId: "V1",
    tractorNuevo: { enViaje: true, viajeActivo: "V2" }, nuevoId: "T2",
  })).toThrow("disponible");
  expect(() => prepararCambioTractor({
    viaje: { estado: true, tractor: "T1" }, viajeId: "V1",
    tractorAnterior: { viajeActivo: "V2" }, nuevoId: null,
  })).toThrow("no pertenece");
});

test("libera furgones sin cambiar persona, tractor ni situación", () => {
  const resultado = prepararLiberacionFurgon({
    viaje: { estado: true, persona: "P1", tractor: "T1", furgon: ["F1", "F2"], situacion: "EN_CURSO" },
    viajeId: "V1", furgon: { viajeActivo: "V1" }, furgonId: "F1",
  });
  expect(resultado).toEqual({ furgon: ["F2"], situacion: "EN_CURSO", persona: "P1", tractor: "T1" });
  expect(prepararLiberacionFurgon({
    viaje: { estado: true, persona: "P1", tractor: "T1", furgon: ["F1"], situacion: "EN_CURSO" },
    viajeId: "V1", furgon: { viajeActivo: "V1" }, furgonId: "F1",
  }).furgon).toEqual([]);
});

test("finaliza usando solamente recursos actualmente asociados", () => {
  expect(recursosActualesParaFinalizar({ persona: "P1", tractor: null, furgon: ["F2"] })).toEqual([
    { tipo: "personas", id: "P1" }, { tipo: "furgones", id: "F2" },
  ]);
  expect(recursosActualesParaFinalizar({ persona: "P1", tractor: "T1", furgon: [] })).toEqual([
    { tipo: "personas", id: "P1" }, { tipo: "tractores", id: "T1" },
  ]);
});

test("bloquea cruces sin tractor y conserva cruces con tractor", () => {
  expect(puedeCrearCruceViaje({ estado: true, tractor: null, situacion: "ESPERANDO_TRACTOR" })).toBe(false);
  expect(puedeCrearCruceViaje({ estado: true, tractor: "T1", situacion: "EN_CURSO" })).toBe(true);
});
