import fs from "fs";
import path from "path";

const rules = fs.readFileSync(path.join(process.cwd(), "firestore.rules"), "utf8");

describe("permisos de anulaciones", () => {
  test.each([
    ["movimientos", "movimientosWrite"],
    ["viajes", "viajesWrite"],
    ["cruces", "crucesWrite"],
    ["liquidaciones", "liquidacionesWrite"],
  ])("la auditoria de %s exige %s", (tipo, permiso) => {
    expect(rules).toContain(`request.resource.data.tipoOperacion == '${tipo}'`);
    expect(rules).toContain(`hasPermission('${permiso}')`);
  });

  test("la auditoria no puede modificarse ni eliminarse", () => {
    expect(rules).toContain("match /anulaciones/{anulacionId}");
    expect(rules).toContain("allow update, delete: if false;");
  });

  test("la identidad autenticada debe coincidir con la anulacion", () => {
    expect(rules).toContain("request.resource.data.uidAnulacion == request.auth.uid");
  });

  test("una operacion anulada no puede reactivarse ni alterar su metadata", () => {
    expect(rules).toContain("function preservesCancellation()");
    expect(rules).toContain("request.resource.data.anulado == true");
    expect(rules).toContain("return resource.data.get('anulado', false) != true;");
  });

  test.each(["viajes", "movimientos", "cruces", "liquidaciones"])(
    "%s aplica preservacion y prohibe eliminacion",
    (coleccion) => {
      const inicio = rules.indexOf(`match /${coleccion}/{resourceId}`);
      const bloque = rules.slice(inicio, rules.indexOf("match /", inicio + 10));
      expect(bloque).toContain("preservesCancellation()");
      expect(bloque).toContain("allow delete: if false;");
    },
  );
});
