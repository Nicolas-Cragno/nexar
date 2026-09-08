import Swal from "sweetalert2";
import { runTransaction } from "firebase/firestore";
import { eventCode } from "../../../functions/abmFunctions";
import { submitViaje, submitMovimientoCuenta, submitCruce } from "./Submits";

jest.mock("sweetalert2", () => ({ fire: jest.fn() }));
jest.mock("../../../firebase/firebaseConfig", () => ({ db: {} }));
jest.mock("firebase/firestore", () => ({
  doc: (_db, collection, id) => `${collection}/${id}`,
  serverTimestamp: () => "timestamp",
  increment: (value) => value,
  runTransaction: jest.fn(),
}));
jest.mock("../../../functions/abmFunctions", () => ({
  eventCode: jest.fn(), statusOptions: jest.fn(), submit: jest.fn(), update: jest.fn(),
}));
jest.mock("../../../functions/dataFunctions", () => ({
  verificarCamposObligatorios: () => true,
  formatearCampoParaCarga: (value) => value,
  formatearCampoFirestore: String,
  formatearMonto: String,
}));

// Doble en memoria: escrituras diferidas, control de versiones y reintentos.
// No conecta con Firebase ni pretende verificar Rules o el SDK.
let documentos;
let versiones;
let intentos;
let lecturas;
let rechazarEscritura;
const camposPara = (data) => Object.keys(data).map((key) => ({ key, use: "database" }));
const datos = (suffix = "1") => ({ persona: `p${suffix}`, tractor: `t${suffix}`, furgon: [`f${suffix}`], adelanto: 100 });
const cargar = (data = datos(), elemento = null, onGuardar = null) => submitViaje(
  data, camposPara(data), [{ id: "01" }], [], "01", jest.fn(), onGuardar, jest.fn(), [], elemento,
);

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  Swal.fire.mockResolvedValue({ isConfirmed: true });
  documentos = new Map([["contadores/viajes", { ultimo: 500, "01": 500 }]]);
  for (const suffix of ["1", "2"]) {
    for (const [collection, prefix] of [["personas", "p"], ["tractores", "t"], ["furgones", "f"]]) {
      documentos.set(`${collection}/${prefix}${suffix}`, { enViaje: false, viajeActivo: null });
    }
  }
  versiones = new Map();
  intentos = 0;
  lecturas = [];
  rechazarEscritura = null;
  runTransaction.mockImplementation(async (_db, callback) => {
    for (let retry = 0; retry < 5; retry++) {
      intentos++;
      const reads = new Map();
      const writes = [];
      const result = await callback({
        get: async (ref) => {
          if (writes.length) throw new Error("Lectura despues de escritura");
          lecturas.push(ref);
          reads.set(ref, versiones.get(ref) || 0);
          const value = documentos.get(ref);
          return { exists: () => value !== undefined, data: () => value, id: ref.split("/")[1] };
        },
        set: (ref, value) => writes.push({ ref, value, update: false }),
        update: (ref, value) => writes.push({ ref, value, update: true }),
      });
      if ([...reads].some(([ref, version]) => (versiones.get(ref) || 0) !== version)) continue;
      for (const write of writes) {
        if (write.ref === rechazarEscritura) throw new Error("Escritura rechazada");
        if (write.update && !documentos.has(write.ref)) throw new Error("Documento inexistente");
      }
      for (const write of writes) {
        documentos.set(write.ref, write.update ? { ...documentos.get(write.ref), ...write.value } : write.value);
        versiones.set(write.ref, (versiones.get(write.ref) || 0) + 1);
      }
      return result;
    }
    throw new Error("Reintentos agotados");
  });
});
afterEach(() => jest.restoreAllMocks());

test("alta confirma contador, viaje y todos los recursos juntos", async () => {
  const viaje = await cargar();
  expect(viaje.id).toBe("001-00000501");
  expect(documentos.get("contadores/viajes")).toEqual({ ultimo: 501, "01": 501 });
  expect(documentos.get(`viajes/${viaje.id}`)).toEqual(viaje);
  for (const ref of ["personas/p1", "tractores/t1", "furgones/f1"]) {
    expect(documentos.get(ref)).toMatchObject({ enViaje: true, viajeActivo: viaje.id });
  }
  expect(runTransaction).toHaveBeenCalledTimes(1);
  expect(eventCode).not.toHaveBeenCalled();
});

test.each(["personas/p1", "tractores/t1", "furgones/f1"])("validacion fallida de %s no consume contador ni cambia recursos", async (ref) => {
  documentos.delete(ref);
  const antes = new Map(documentos);
  expect(await cargar()).toBeNull();
  expect(documentos).toEqual(antes);
});

test("rechazo de escritura de recurso no confirma ninguna escritura", async () => {
  rechazarEscritura = "furgones/f1";
  const antes = new Map(documentos);
  expect(await cargar()).toBeNull();
  expect(documentos).toEqual(antes);
});

test("dos altas concurrentes validas recalculan el ID al reintentar", async () => {
  const resultados = await Promise.all([cargar(datos("1")), cargar(datos("2"))]);
  expect(resultados.map((v) => v.id).sort()).toEqual(["001-00000501", "001-00000502"]);
  expect(documentos.get("contadores/viajes")["01"]).toBe(502);
  expect(intentos).toBeGreaterThan(2);
  for (const viaje of resultados) expect(documentos.has(`viajes/${viaje.id}`)).toBe(true);
});

test("competencia por un recurso aborta el alta perdedora sin consumir otro numero", async () => {
  const resultados = await Promise.all([cargar(), cargar({ ...datos("2"), persona: "p1" })]);
  expect(resultados.filter(Boolean)).toHaveLength(1);
  expect(resultados).toContain(null);
  expect(documentos.get("contadores/viajes")["01"]).toBe(501);
  expect(documentos.has("viajes/001-00000502")).toBe(false);
  expect(documentos.get("tractores/t2").enViaje).toBe(false);
  expect(intentos).toBeGreaterThan(2);
});

test.each([false, true])("no sobrescribe un ID existente, anulado=%s", async (anulado) => {
  documentos.set("viajes/001-00000501", { id: "001-00000501", anulado });
  const antes = new Map(documentos);
  expect(await cargar()).toBeNull();
  expect(documentos).toEqual(antes);
});

test("edicion conserva ID, reasigna tractor y no accede al contador", async () => {
  const viaje = await cargar();
  const contador = documentos.get("contadores/viajes");
  lecturas = [];
  const editado = await cargar({ ...datos(), tractor: "t2" }, viaje);
  expect(editado.id).toBe(viaje.id);
  expect(documentos.get("contadores/viajes")).toBe(contador);
  expect(lecturas).not.toContain("contadores/viajes");
  expect(documentos.get("tractores/t1").enViaje).toBe(false);
  expect(documentos.get("tractores/t2").viajeActivo).toBe(viaje.id);
});

test.each(["PAGO", "cruce"])("fallo posterior de %s preserva viaje y correlativo confirmado", async (tipo) => {
  const viaje = await cargar();
  const antes = new Map(documentos);
  eventCode.mockResolvedValue({ id: "001-00000001" });
  const data = tipo === "PAGO"
    ? { viaje: viaje.id, tipo: "PAGO", persona: "cuenta-inexistente", monto: 100 }
    : { viaje: viaje.id, persona: viaje.persona, tractor: viaje.tractor, furgon: viaje.furgon };
  if (tipo === "cruce") rechazarEscritura = "cruces/001-00000001";
  const submitSecundario = tipo === "PAGO" ? submitMovimientoCuenta : submitCruce;
  expect(await submitSecundario(data, camposPara(data), [], [], "01", jest.fn(), null, null)).toBeNull();
  expect(documentos).toEqual(antes);
});

test("callback fallido despues del commit conserva el viaje creado", async () => {
  expect(await cargar(datos(), null, async () => { throw new Error("Callback fallido"); })).toBeNull();
  expect(documentos.has("viajes/001-00000501")).toBe(true);
  expect(documentos.get("contadores/viajes")["01"]).toBe(501);
});
