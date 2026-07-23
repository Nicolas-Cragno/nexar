import fs from "fs";
import path from "path";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig.js";

const camposFecha = ["fecha", "fechaSalida", "fechaLlegada"];

function convertirFechas(obj, campo = null) {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertirFechas(item));
  }

  if (obj !== null && typeof obj === "object") {
    const nuevo = {};

    for (const key in obj) {
      nuevo[key] = convertirFechas(obj[key], key);
    }

    return nuevo;
  }

  if (
    typeof obj === "string" &&
    camposFecha.includes(campo)
  ) {
    // Fecha inválida usada como "vacía"
    if (obj.startsWith("1900-01-00")) {
      return null;
    }

    const fecha = new Date(obj);

    if (!isNaN(fecha.getTime())) {
      return Timestamp.fromDate(fecha);
    }
  }

  return obj;
}

export const migrarColeccion = async (
  archivoJSON,
  coleccion,
  campoId = "id"
) => {
  try {
    const ruta = path.resolve(archivoJSON);

    const data = JSON.parse(
      fs.readFileSync(ruta, "utf8")
    );

    console.log(
      `[SCRIPT] Migrando ${data.length} registros a ${coleccion}`
    );

    for (const item of data) {
      const docId = String(item[campoId]);
      const documento = convertirFechas(item);

      await setDoc(
        doc(db, coleccion, docId),
        documento,
        { merge: true }
      );

      console.log(`✅ ${docId}`);
    }

    console.log("[SCRIPT] Finalizado");
  } catch (error) {
    console.error(error);
  }
};

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(
    "Uso: node cargarColeccion.js <archivoJSON> <coleccion> [campoId]"
  );
} else {
  const [archivoJSON, coleccion, campoId] = args;

  await migrarColeccion(
    archivoJSON,
    coleccion,
    campoId || "id"
  );
}